class EnableUuid < ActiveRecord::Migration[7.1]
  def change
    enable_extension "pgcrypto" unless Rails.env.production?
  end
end
