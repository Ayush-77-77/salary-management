class JsonWebToken
  ALGORITHM = "HS256".freeze
  EXPIRY = 24.hours

  class << self
    def encode(payload, expires_at = EXPIRY.from_now)
      JWT.encode(payload.merge(exp: expires_at.to_i), secret, ALGORITHM)
    end

    # Returns the payload hash, or nil if the token is invalid or expired.
    def decode(token)
      JWT.decode(token, secret, true, algorithm: ALGORITHM).first
    rescue JWT::DecodeError
      nil
    end

    private

    def secret
      Rails.application.secret_key_base
    end
  end
end
