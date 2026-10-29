module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: :login
      rate_limit to: 10, within: 1.minute, only: :login,
                 with: -> { render_errors("Too many login attempts. Try again later.", :too_many_requests) }

      def login
        user = User.authenticate_by(email: params[:email].to_s, password: params[:password].to_s)

        if user
          render json: { token: JsonWebToken.encode(user_id: user.id), user: user_json(user) }
        else
          render_errors("Invalid email or password", :unauthorized)
        end
      end

      def me
        render json: { user: user_json(current_user) }
      end

      private

      def user_json(user)
        { id: user.id, email: user.email }
      end
    end
  end
end
