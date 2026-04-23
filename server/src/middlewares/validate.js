const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        errors: error.details.map(err => err.message)
      });
    }

    // Store validated data separately
    req.validatedBody = value;

    next();
  };
};

module.exports = { validate };
