# PGP TOOLBOX
a minimalist, client-side OpenPGP utility built for fast, secure cryptographic operations directly in your browser... 
pro-privacy, anti-glowie tech, without any external dependencies. this project was initially a part of my personal website "nirvanos", which I'm currently in the process of building...


## What is PGP?

Pretty Good Privacy (PGP) is an asymmetric cryptographic framework used to secure communications across untrusted mediums like standard email, forums, or instant messaging. It operates on a public-key architecture consisting of two distinct components:

* **Public Key:** distributed freely to anyone. other people will need to use it to encrypt messages meant for you, or to verify that a signature originated from your identity.
* **Private Key:** kept strictly confidential and never shared... you use it to decrypt messages encrypted to your public key, or to sign documents to prove authenticity.

By separating the key used for encryption from the key used for decryption, PGP ensures that eavesdroppers, host providers, and state actors cannot look into or tamper with your data in transit, even if they control the underlying network infrastructure.


## What This Tool Provides

This toolbox is designed as a standalone utility for day-to-day operational security, keeping your workflows completely local.

* Powered entirely by `openpgp.js` executing within your local browser context. Your private keys, passphrases, and unencrypted cleartext never leave your machine and are never transmitted over the wire (pun intended ;-;)
* Paste any armored key block to instantly parse and verify its fingerprint, User ID, creation date, and object identifier (OID) without relying on remote keyservers.
* Fast, client-side encryption using a recipient's public key, and decryption of incoming payloads using your password-protected private key.
* Generate cleartext signatures to prove authorship of your statements, or verify the signatures of third parties to detect tampering.
* Generate new public/private key pairs locally with custom names, emails, and passphrases instantly.
* Your workspace survives accidental page refreshes, but flushes automatically the moment you close the browser tab, leaving no permanent footprint behind on shared hardware.


## Security Model

This tool is explicitly built for environments where you must minimize your digital footprint and avoid reliance on remote black-box infrastructure. 

* No telemetry, tracking pixels, or external scripts are loaded.
* Every single operation—from key generation to decryption—happens purely inside your browser's runtime memory.
* The logic relies on a single open-source core library, allowing you to easily verify that your sensitive inputs are handled with zero leaks.
