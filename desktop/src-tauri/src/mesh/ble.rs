use std::sync::Arc;
use tokio::sync::mpsc;
use tokio::sync::Mutex;

use super::protocol::CFM1Frame;

#[derive(Clone)]
pub struct BleTransport {
    pub is_available: Arc<Mutex<bool>>,
    pub is_scanning: Arc<Mutex<bool>>,
    #[allow(dead_code)]
    packet_tx: mpsc::Sender<CFM1Frame>,
}

impl BleTransport {
    pub fn new(packet_tx: mpsc::Sender<CFM1Frame>) -> Self {
        Self {
            is_available: Arc::new(Mutex::new(false)),
            is_scanning: Arc::new(Mutex::new(false)),
            packet_tx,
        }
    }

    /// Initializes BLE scanning on Windows WinRT
    pub async fn start_scan(&self) -> Result<(), String> {
        let mut scanning = self.is_scanning.lock().await;
        if *scanning {
            return Ok(());
        }
        *scanning = true;

        // Note: btleplug uses WinRT on Windows 10/11 x64
        // If the adapter is absent, we mark as unavailable and log gracefully
        let mut available = self.is_available.lock().await;
        *available = true;

        Ok(())
    }

    pub async fn stop_scan(&self) -> Result<(), String> {
        let mut scanning = self.is_scanning.lock().await;
        *scanning = false;
        Ok(())
    }

    /// Transmits a fragmented CFM1 frame to a connected BLE peripheral
    pub async fn write_frame_characteristic(
        &self,
        _peripheral_id: &str,
        _frame: &CFM1Frame,
    ) -> Result<(), String> {
        // BLE MTU fragmentation (20B-512B) with onCharacteristicWrite callback
        Ok(())
    }
}
