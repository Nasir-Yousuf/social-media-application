use keyring::Entry;

const SERVICE_NAME: &str = "Clearfeed";
const TOKEN_USER: &str = "jwt_token";
const MESH_SECRET_USER: &str = "mesh_ed25519_secret";
const MESH_PUBKEY_USER: &str = "mesh_ed25519_public";

pub fn secure_store_token(token: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, TOKEN_USER).map_err(|e| e.to_string())?;
    entry.set_password(token).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn secure_get_token() -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, TOKEN_USER).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(pass) => Ok(Some(pass)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

pub fn secure_delete_token() -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, TOKEN_USER).map_err(|e| e.to_string())?;
    match entry.delete_password() {
        Ok(_) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub fn secure_store_mesh_key(secret_hex: &str, public_hex: &str) -> Result<(), String> {
    let entry_sec = Entry::new(SERVICE_NAME, MESH_SECRET_USER).map_err(|e| e.to_string())?;
    entry_sec.set_password(secret_hex).map_err(|e| e.to_string())?;

    let entry_pub = Entry::new(SERVICE_NAME, MESH_PUBKEY_USER).map_err(|e| e.to_string())?;
    entry_pub.set_password(public_hex).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn secure_get_mesh_key() -> Result<Option<(String, String)>, String> {
    let entry_sec = Entry::new(SERVICE_NAME, MESH_SECRET_USER).map_err(|e| e.to_string())?;
    let entry_pub = Entry::new(SERVICE_NAME, MESH_PUBKEY_USER).map_err(|e| e.to_string())?;

    let secret = match entry_sec.get_password() {
        Ok(s) => s,
        Err(keyring::Error::NoEntry) => return Ok(None),
        Err(e) => return Err(e.to_string()),
    };

    let public = match entry_pub.get_password() {
        Ok(p) => p,
        Err(keyring::Error::NoEntry) => return Ok(None),
        Err(e) => return Err(e.to_string()),
    };

    Ok(Some((secret, public)))
}
