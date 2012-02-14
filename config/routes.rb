EditableList::Application.routes.draw do
  resources :phrases, :only => [:index]
  root :to => "phrases#index"
end
