const crypto = require("crypto");
const Url = require("../models/Url");

const CODE_LENGTH = 6;
const CODE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MAX_ATTEMPTS = 5;
const SHORT_CODE_PATTERN = new RegExp(`^[A-Za-z0-9]{${CODE_LENGTH}}$`);

// --------------------
// Helpers
// --------------------

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const generateShortCode = () => {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  }
  return code;
};

const isDuplicateShortCode = (error) =>
  error.code === 11000 && error.keyPattern?.shortCode;

// --------------------
// Controllers
// --------------------

const shortenUrl = async (req, res, next) => {
  const originalUrl = req.body?.originalUrl?.trim?.();

  if (!originalUrl || !isValidUrl(originalUrl)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid http or https URL",
    });
  }

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

  try {
    // The unique index on shortCode guarantees uniqueness; retry on the rare collision
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const url = await Url.create({
          originalUrl,
          shortCode: generateShortCode(),
        });

        return res.status(201).json({
          success: true,
          data: {
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            shortUrl: `${baseUrl}/${url.shortCode}`,
            createdAt: url.createdAt,
          },
        });
      } catch (error) {
        if (!isDuplicateShortCode(error)) throw error;
      }
    }

    throw new Error("Could not generate a unique short code");
  } catch (error) {
    next(error);
  }
};

const redirectToUrl = async (req, res, next) => {
  const { code } = req.params;

  try {
    // Skip the DB lookup for anything that can't be a generated code (e.g. /favicon.ico)
    const url = SHORT_CODE_PATTERN.test(code)
      ? await Url.findOne({ shortCode: code })
      : null;

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { shortenUrl, redirectToUrl };
