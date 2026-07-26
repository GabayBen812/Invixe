function splitDisplayName(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return { firstName: null, lastName: null };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: null, lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || null,
  };
}

function buildDisplayName(firstName, lastName) {
  return [firstName, lastName].map((part) => String(part || "").trim()).filter(Boolean).join(" ");
}

/** Ignore legacy rows where `name` was set to the login email. */
function parseUserName(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  const rawName = String(user?.name || "").trim();
  if (!rawName) {
    return { firstName: null, lastName: null };
  }
  if (rawName.toLowerCase() === email || rawName.includes("@")) {
    return { firstName: null, lastName: null };
  }
  return splitDisplayName(rawName);
}

module.exports = {
  splitDisplayName,
  buildDisplayName,
  parseUserName,
};
