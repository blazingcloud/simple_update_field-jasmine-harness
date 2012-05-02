Phrase.create!(:text => "hello")
Phrase.create!(:text => "hello2")
Phrase.create!(:text => "hello23")
Phrase.create!(:text => "hello332")

9000.times do
  Phrase.create!(:text => "I'm a long phrase! "*6 )
end
