Rails.application.routes.draw do
  root "portal#portal"

  get "employee", to: "employee#index", as: "employee_index"
  get "employee/menu", to: "employee#employee", as: "employee_menu"

  resources :employee, only: [ :update ]

  get "admin", to: "profiles#index", as: "admin_index"
  resources :profiles, path: "admin", as: "admin", except: [ :index ]

resources :attendances, only: [:create] do
  collection do
    patch :check_out
  end
end

  get "up" => "rails/health#show", as: :rails_health_check
end
