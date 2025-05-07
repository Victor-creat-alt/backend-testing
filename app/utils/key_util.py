import secrets

# Generate a secure random key
secure_key = secrets.token_hex(32)  # Generates a 64-character hexadecimal string
print("Generated Secure Key:", secure_key)