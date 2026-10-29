module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  attr_reader :current_user

  def authenticate_user!
    payload = JsonWebToken.decode(bearer_token.to_s)
    @current_user = User.find_by(id: payload["user_id"]) if payload

    render_errors("Unauthorized", :unauthorized) unless current_user
  end

  def bearer_token
    request.authorization&.delete_prefix("Bearer ")
  end
end
