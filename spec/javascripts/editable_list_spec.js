describe("Editable",function() {
  beforeEach(function(){
    fixture = "<div class='phrase'><span class='text'>CAKE</span></div>";
    setFixtures(fixture);
  });
  it("it has a constructor", function() {
    expect(Editable).toBeDefined()
    expect(Editable()).toBeDefined()
  })
  it("Editable list takes a selector to install itself with",function() {
    Editable('.phrase .text')
    expect($('.phrase .text').data('editable')).toBeDefined()
  })
  describe("completed edit event handler", function() {
    it("transmits the input data from the current editable to the server",function() {

    })
  })
  describe("click event handler", function() {
    it("turns a element into an input field",function() {

    })
  })
  describe("tab event handler", function() {
    it("focuses a selected input field from current editable to the next known editable",function() {
    })
  })
})
