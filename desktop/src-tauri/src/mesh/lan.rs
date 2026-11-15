use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream, UdpSocket};
use tokio::sync::mpsc;
use tokio::sync::Mutex;

use super::protocol::{CFM1Frame, CFM1_DEFAULT_LAN_PORT};

pub struct LanTransport {
    pub is_running: Arc<Mutex<bool>>,
    packet_tx: mpsc::Sender<CFM1Frame>,
}

impl LanTransport {
    pub fn new(packet_tx: mpsc::Sender<CFM1Frame>) -> Self {
        Self {
            is_running: Arc::new(Mutex::new(false)),
            packet_tx,
        }
    }

    /// Starts TCP server and UDP discovery beacon listeners
    pub async fn start(&self) -> Result<(), String> {
        let mut running = self.is_running.lock().await;
        if *running {
            return Ok(());
        }
        *running = true;

        let is_running_clone = self.is_running.clone();
        let packet_tx_clone = self.packet_tx.clone();

        // 1. TCP Server Listener (Port 49152)
        tokio::spawn(async move {
            let addr = format!("0.0.0.0:{}", CFM1_DEFAULT_LAN_PORT);
            if let Ok(listener) = TcpListener::bind(&addr).await {
                while *is_running_clone.lock().await {
                    match listener.accept().await {
                        Ok((mut socket, peer_addr)) => {
                            let tx = packet_tx_clone.clone();
                            tokio::spawn(async move {
                                Self::handle_tcp_connection(&mut socket, peer_addr, tx).await;
                            });
                        }
                        Err(_) => break,
                    }
                }
            }
        });

        // 2. UDP Beacon Receiver
        let is_running_udp = self.is_running.clone();
        let packet_tx_udp = self.packet_tx.clone();
        tokio::spawn(async move {
            let addr = format!("0.0.0.0:{}", CFM1_DEFAULT_LAN_PORT);
            if let Ok(socket) = UdpSocket::bind(&addr).await {
                socket.set_broadcast(true).ok();
                let mut buf = [0u8; 2048];
                while *is_running_udp.lock().await {
                    if let Ok((len, _peer)) = socket.recv_from(&mut buf).await {
                        if let Ok(frame) = CFM1Frame::deserialize(&buf[0..len]) {
                            packet_tx_udp.send(frame).await.ok();
                        }
                    }
                }
            }
        });

        Ok(())
    }

    /// Sends a CFM1 frame directly to an IP:Port over TCP with 4-byte BE length prefix
    pub async fn send_tcp_direct(target_addr: &str, frame: &CFM1Frame) -> Result<(), String> {
        let mut stream = TcpStream::connect(target_addr)
            .await
            .map_err(|e| format!("Failed to connect to {}: {}", target_addr, e))?;

        let framed = frame.serialize_length_prefixed();
        stream
            .write_all(&framed)
            .await
            .map_err(|e| format!("Failed to write to stream: {}", e))?;

        stream.flush().await.map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Broadcasts an announcement beacon via UDP
    pub async fn broadcast_udp_beacon(frame: &CFM1Frame) -> Result<(), String> {
        let socket = UdpSocket::bind("0.0.0.0:0")
            .await
            .map_err(|e| e.to_string())?;
        socket.set_broadcast(true).map_err(|e| e.to_string())?;

        let bytes = frame.serialize();
        let broadcast_target = format!("255.255.255.255:{}", CFM1_DEFAULT_LAN_PORT);
        socket
            .send_to(&bytes, &broadcast_target)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn handle_tcp_connection(
        socket: &mut TcpStream,
        _peer_addr: SocketAddr,
        tx: mpsc::Sender<CFM1Frame>,
    ) {
        loop {
            // Read 4-byte Big-Endian length header
            let mut len_buf = [0u8; 4];
            if socket.read_exact(&mut len_buf).await.is_err() {
                break;
            }
            let length = u32::from_be_bytes(len_buf) as usize;
            if length == 0 || length > 10 * 1024 * 1024 {
                break; // Reject invalid frame size
            }

            // Read frame payload
            let mut frame_buf = vec![0u8; length];
            if socket.read_exact(&mut frame_buf).await.is_err() {
                break;
            }

            if let Ok(frame) = CFM1Frame::deserialize(&frame_buf) {
                if tx.send(frame).await.is_err() {
                    break;
                }
            }
        }
    }
}
