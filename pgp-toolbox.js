import * as openpgp from "./openpgp.min.js";

const state = {
  publicKey: null,
  privateKey: null,
};
const elements = new Proxy(
  {
    publicKey: '[name="pgp-public-key"]',
    publicUserID: ".public.userID",
    publicOID: ".public.OID",
    publicCreatedAt: ".public.createdAt",
    publicExpiresAt: ".public.expiresAt",
    publicFingerprint: ".public.fingerprint",
    publicError: ".public .error",

    privateKey: '[name="pgp-private-key"]',
    privateUserID: ".private.userID",
    privateOID: ".private.OID",
    privateCreatedAt: ".private.createdAt",
    privateExpiresAt: ".private.expiresAt",
    privateFingerprint: ".private.fingerprint",
    privateError: ".private .error",

    encryptMessage: '[name="pgp-encrypt"]',
    encryptError: ".encrypt .error",
    encryptRecipient: ".encrypt.recipient",
    encryptOutput: ".output.encrypt",

    decryptMessage: '[name="pgp-decrypt"]',
    decryptError: ".decrypt .error",
    decryptRecipient: ".decrypt.recipient",
    decryptOutput: ".output.decrypt",
    decryptPassword: '[name="pgp-decrypt-password"]',

    signMessage: '[name="pgp-sign"]',
    signError: ".sign .error",
    signSigner: ".sign.signer",
    signOutput: ".output.sign",
    signPassword: '[name="pgp-sign-password"]',

    verifyMessage: '[name="pgp-verify"]',
    verifyError: ".verify .error",
    verifySender: ".verify.sender",
    verifySuccess: ".verify .success",

    generatePassword: '[name="new-password"]',
    generateName: '[name="new-name"]',
    generateEmail: '[name="new-email"]',
    generateKey: ".generate-key",
    generatePublicKey: ".generated.public-key",
    generatePrivateKey: ".generated.private-key",
  },
  {
    get(target, key) {
      return document.querySelector(target[key]);
    },
  },
);

function resetPublicKey() {
  for (const k of [
    "publicFingerprint",
    "publicCreatedAt",
    "publicExpiresAt",
    "publicUserID",
    "publicOID",
    "encryptRecipient",
    "verifySender",
  ]) {
    elements[k].textContent = "n/a";
  }
  elements.publicError.style.display = "none";
}

function resetPrivateKey() {
  for (const k of [
    "privateFingerprint",
    "privateCreatedAt",
    "privateExpiresAt",
    "privateUserID",
    "privateOID",
    "decryptRecipient",
    "signSigner",
  ]) {
    elements[k].textContent = "n/a";
  }
  elements.privateError.style.display = "none";
}

elements.publicKey.addEventListener("input", async (event) => {
  const {
    target: { value: armoredKey },
  } = event;
  await setPublicKey(armoredKey);
  sessionStorage.setItem("publicKey", armoredKey);
});

async function setPublicKey(armoredKey) {
  if (!armoredKey) {
    resetPublicKey();
    return;
  }
  let publicKey;
  try {
    state.publicKey = publicKey = await openpgp.readKey({
      armoredKey,
    });
  } catch (e) {
    resetPublicKey();
    elements.publicError.style = "";
    elements.publicError.textContent = e;
    return;
  }
  //console.log(publicKey);
  elements.publicError.style.display = "none";
  const {
    keyPacket: {
      created,
      expirationTimeV3,
      fingerprint,
      publicParams: { oid },
    },
    users,
  } = publicKey;
  elements.publicCreatedAt.textContent = created.toJSON();
  elements.publicExpiresAt.textContent = expirationTimeV3
    ? `${expirationTimeV3} days`
    : "n/a";
  elements.publicFingerprint.textContent = u8_to_hex(fingerprint);
  const userArray = [];
  for (const user of users) {
    userArray.push(user.userID.userID);
  }
  elements.publicUserID.textContent =
    elements.encryptRecipient.textContent =
    elements.verifySender.textContent =
      userArray.join(", ");
  try {
    elements.publicOID.textContent = oid.getName();
  } catch (e) {
    console.error(e);
    elements.publicOID.textContent = "<unknown>";
  }
}

elements.privateKey.addEventListener("input", async (event) => {
  const {
    target: { value: armoredKey },
  } = event;
  await setPrivateKey(armoredKey);
  sessionStorage.setItem("privateKey", armoredKey);
});

async function setPrivateKey(armoredKey) {
  if (!armoredKey) {
    resetPrivateKey();
    return;
  }
  let privateKey;
  try {
    state.privateKey = privateKey = await openpgp.readKey({
      armoredKey,
    });
  } catch (e) {
    resetPrivateKey();
    elements.privateError.style = "";
    elements.privateError.textContent = e;
    return;
  }
  //console.log(privateKey);
  elements.privateError.style.display = "none";
  const {
    keyPacket: {
      created,
      expirationTimeV3,
      fingerprint,
      publicParams: { oid },
    },
    users,
  } = privateKey;
  elements.privateCreatedAt.textContent = created.toJSON();
  elements.privateExpiresAt.textContent = expirationTimeV3
    ? `${expirationTimeV3} days`
    : "n/a";
  elements.privateFingerprint.textContent = u8_to_hex(fingerprint);
  const userArray = [];
  for (const user of users) {
    userArray.push(user.userID.userID);
  }
  elements.privateUserID.textContent =
    elements.decryptRecipient.textContent =
    elements.signSigner.textContent =
      userArray.join(", ");

  try {
    elements.privateOID.textContent = oid.getName();
  } catch (e) {
    console.error(e);
    elements.privateOID.textContent = "<unknown>";
  }
}

elements.encryptMessage.addEventListener("input", async (event) => {
  const {
    target: { value },
  } = event;
  state.encryptText = value;
  debouncedEncrypt();
});

let encryptTimeout;
function debouncedEncrypt() {
  clearTimeout(encryptTimeout);
  encryptTimeout = setTimeout(encryptMessage, 250);
}

async function encryptMessage() {
  const text = state.encryptText;
  if (!text) {
    elements.encryptOutput.value = "";
    elements.encryptError.style.display = "none";
    return;
  }
  let encrypted;
  try {
    const message = await openpgp.createMessage({ text });
    if (!state.publicKey) throw new Error("Missing public key!");
    encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: state.publicKey,
    });
  } catch (e) {
    elements.encryptError.style = "";
    elements.encryptError.textContent = e;
    return;
  }
  elements.encryptError.style.display = "none";
  elements.encryptOutput.value = encrypted;
}

elements.decryptMessage.addEventListener("input", async (event) => {
  const {
    target: { value: armoredMessage },
  } = event;
  if (!armoredMessage) {
    elements.decryptOutput.value = "";
    elements.decryptError.style.display = "none";
    return;
  }
  debouncedDecrypt();
});

elements.decryptPassword.addEventListener("input", async (event) => {
  const {
    target: { value },
  } = event;
  state.decryptPassword = value;
  elements.signPassword.value = value;
  sessionStorage.setItem("password", value);
  if (elements.decryptMessage.value) {
    debouncedDecrypt();
  }
});

elements.signMessage.addEventListener("input", async (event) => {
  const {
    target: { value: armoredMessage },
  } = event;
  if (!armoredMessage) {
    elements.signOutput.value = "";
    elements.signError.style.display = "none";
    return;
  }
  debouncedSign();
});

elements.verifyMessage.addEventListener("input", async (event) => {
  const {
    target: { value: armoredMessage },
  } = event;
  if (!armoredMessage) {
    elements.verifyError.style.display = "none";
    elements.verifySuccess.style.display = "none";
    return;
  }
  debouncedVerify();
});

elements.signPassword.addEventListener("input", async (event) => {
  const {
    target: { value },
  } = event;
  state.decryptPassword = value;
  elements.decryptPassword.value = value;
  sessionStorage.setItem("password", value);
  if (elements.signMessage.value) {
    debouncedSign();
  }
});

elements.generateKey.addEventListener("click", async (event) => {
  event.preventDefault();
  const name = elements.generateName.value || undefined;
  const email = elements.generateEmail.value || undefined;
  const passphrase = elements.generatePassword.value || undefined;
  let keys;
  try {
    keys = await openpgp.generateKey({
      userIDs: {
        name,
        email,
      },
      passphrase,
    });
  } catch (e) {
    alert(e);
    return;
  }
  const { privateKey, publicKey } = keys;
  elements.generatePrivateKey.value = privateKey;
  elements.generatePublicKey.value = publicKey;
});

let decryptTimeout;
function debouncedDecrypt() {
  clearTimeout(decryptTimeout);
  decryptTimeout = setTimeout(decryptMessage, 500);
}

async function decryptMessage() {
  const armoredMessage = elements.decryptMessage.value;
  let decrypted;
  try {
    if (!state.privateKey) throw new Error("Missing private key!");
    let decryptedKey = state.privateKey;
    if (state.privateKey.keyPacket.isEncrypted) {
      decryptedKey = await openpgp.decryptKey({
        privateKey: state.privateKey,
        passphrase: state.decryptPassword,
      });
    }
    const message = await openpgp.readMessage({ armoredMessage });
    decrypted = await openpgp.decrypt({
      message,
      decryptionKeys: decryptedKey,
    });
  } catch (e) {
    elements.decryptError.style = "";
    elements.decryptError.textContent = e;
    return;
  }
  elements.decryptError.style.display = "none";
  elements.decryptOutput.value = decrypted.data;
}

let verifyTimeout;
function debouncedVerify() {
  clearTimeout(verifyTimeout);
  verifyTimeout = setTimeout(verifyMessage, 500);
}

async function verifyMessage() {
  const cleartextMessage = elements.verifyMessage.value;
  let signed;
  try {
    if (!state.publicKey) throw new Error("Missing public key!");
    const signedMessage = await openpgp.readCleartextMessage({
      cleartextMessage,
    });
    const verificationResult = await openpgp.verify({
      message: signedMessage,
      verificationKeys: state.publicKey,
    });

    const { verified, keyID } = verificationResult.signatures[0];
    await verified;
  } catch (e) {
    elements.verifySuccess.style.display = "none";
    elements.verifyError.style = "";
    elements.verifyError.textContent = e;
    return;
  }
  elements.verifyError.style.display = "none";
  elements.verifySuccess.style = "";
  elements.verifySuccess.textContent = "Valid!";
}

let signTimeout;
function debouncedSign() {
  clearTimeout(signTimeout);
  signTimeout = setTimeout(signMessage, 500);
}

async function signMessage() {
  const plainMessage = elements.signMessage.value;
  let signed;
  try {
    if (!state.privateKey) throw new Error("Missing private key!");
    let decryptedKey = state.privateKey;
    if (state.privateKey.keyPacket.isEncrypted) {
      decryptedKey = await openpgp.decryptKey({
        privateKey: state.privateKey,
        passphrase: state.decryptPassword,
      });
    }
    const message = await openpgp.createCleartextMessage({
      text: plainMessage,
    });
    signed = await openpgp.sign({
      message,
      signingKeys: decryptedKey,
    });
  } catch (e) {
    elements.signError.style = "";
    elements.signError.textContent = e;
    return;
  }
  elements.signError.style.display = "none";
  elements.signOutput.value = signed;
}

function u8_to_hex(u8) {
  return Array.from(u8)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

(() => {
  const publicKey = sessionStorage.getItem("publicKey");
  if (publicKey) {
    elements.publicKey.value = publicKey;
    setPublicKey(publicKey);
  }
  const privateKey = sessionStorage.getItem("privateKey");
  if (privateKey) {
    elements.privateKey.value = privateKey;
    setPrivateKey(privateKey);
  }
  const password = sessionStorage.getItem("password");
  if (password) {
    state.decryptPassword = password;
    elements.decryptPassword.value = password;
    elements.signPassword.value = password;
  }
})();
