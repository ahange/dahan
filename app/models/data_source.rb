class DataSource < ApplicationRecord
  belongs_to :app
  has_many :data_queries
end
