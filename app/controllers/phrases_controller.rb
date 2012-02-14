class PhrasesController < ApplicationController
  def index
    @phrases = Phrase.limit(5)
  end
end
