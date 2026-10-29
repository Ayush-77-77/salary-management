module ErrorHandling
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :render_record_invalid
    rescue_from ActionController::ParameterMissing, with: :render_parameter_missing
  end

  private

  def render_errors(messages, status)
    render json: { errors: Array(messages) }, status: status
  end

  def render_not_found(error)
    render_errors("#{error.model || "Record"} not found", :not_found)
  end

  def render_record_invalid(error)
    render_errors(error.record.errors.full_messages, :unprocessable_content)
  end

  def render_parameter_missing(error)
    render_errors(error.message, :bad_request)
  end
end
