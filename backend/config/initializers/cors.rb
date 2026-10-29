Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*ENV.fetch("FRONTEND_ORIGINS", "http://localhost:5173").split(","))

    resource "/api/*",
      headers: :any,
      methods: %i[get post patch delete options]
  end
end
