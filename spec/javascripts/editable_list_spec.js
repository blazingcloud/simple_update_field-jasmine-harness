describe("Editable",function() {
  var selector = '.phrase .text'

  it("it has a constructor", function() {
    expect(Editable).toBeDefined()
    expect(Editable()).toBeDefined()
  })

  describe("needs an attribute editable-resource-uri", function() {
    beforeEach(function(){
      var fixture = "<div class='phrase'>"+
        "<span class='text'>CAKE</span>"+
        "</div>"
      // removed from dom each
      // test
      setFixtures(fixture)
    });
    describe("with editable declared",function() {
      beforeEach(function() {
        // Construct
        Editable(selector)
      })
      describe("post to server",function() {
        describe("after clicking and editing",function() {
          describe("error", function() {
            it("resource-uri attribute",function() {

              $(selector)
              .filter(':first')
              .trigger('click.editable')
              $(selector)
              .filter(':first')
              .trigger('blur.editable')

              expect($('.editable-errors')
                     .filter(':first')
                     .text()
                    ).toMatch(
                    "expected editable-resource-uri attribute"
                    )
            })
          })
        })
      })
    })
  })

  describe("with a single match in dom",function() {

    beforeEach(function(){
      var fixture = "<div class='phrase'>"+
        "<span "+
        " editable-resource-uri='http://s/r/i' "+
      " class='text'>CAKE</span>"+
        "</div>"
      setFixtures(fixture)
    });

    it("selector modifies dom",function() {
      Editable(selector)
      expect($(selector).data('editable')).toBeDefined()
    })

    describe("after installation",function() {
      beforeEach(function() {

        Editable(selector)
      })

      describe("changes to the element are saved",function() {
        it("when editing is complete",function() {
          expect(false).toBeTruthy()
        })
      })

      describe("when editing begins", function() {
        describe("an element ",function() {
          it("is an input",function() {
            // best jquery practice - use pseudo selectors after
            // using natural css selectors
            expect($(selector)
                   .filter(':input')
                   .size()
                  ).toBe(0)
                  $(selector)
                  .filter(':first')
                  .trigger('click.editable')
                  expect($(selector)
                         .filter(':input')
                         .size()
                        ).toBe(1)
          })
          it("has same classes",function() {
            $(selector).addClass('cake').addClass('oat')
            $(selector).filter(':first').trigger('click.editable')
            expect($(selector).filter('.cake').size()).toBe(1)
            expect($(selector).filter('.oat').size()).toBe(1)
          })
          it("has same id",function() {
            $(selector).attr('id','boom')
            $(selector).filter(':first').trigger('click.editable')
            expect($(selector).filter('#boom').size()).toBe(1)
          })
          it("stores its text as input value",function() {
            $(selector).filter(':first').text("Lily")
            $(selector).filter(':first').trigger('click.editable')
            expect($(selector).filter(':first').val()).toEqual("Lily")
          })
          it("has a unique position attribute: editable-index",function() {
            $(selector).attr('editable-index','333')
            $(selector).filter(':first').trigger('click.editable')
            expect($(selector).filter(':input').attr('editable-index')).toBe('333')
          })
          it("has same jquery data",function() {
            // data is used in rails and jquery for storage of various properties
            $(selector).data('hi',1)
            $(selector).data('hello',2)
            var expected_data = $(selector).data();
            $(selector).filter(':first').trigger('click.editable')
            // this is the general pattern for iterating correctly in a hash
            // in javascript 
            for(var prop in expected_data) {
              // ignore parent prototype properties
              if(expected_data.hasOwnProperty(prop)) {
                // use proprety expected_data[prop]
                expect($(selector).filter(':input').data(prop)).toEqual(expected_data[prop])
              }
            }
            $(selector).filter(':input').data()
          })
          it("stores previous incarnation: tagName",function() {
            var expected_tag =  $(selector).filter(':first').get(0).tagName
            $(selector).filter(':first').trigger('click.editable')
            expect($(selector).filter(':input').data('editable-was')).toEqual(expected_tag)
          })
          it("is focused",function() {
            expect($(selector).filter(':focus').size()).toBe(0)
            $(selector).filter(':first').trigger('click.editable')
            expect($(selector).filter(':focus').size()).toBe(1)

          })
        })
      })
      describe("when editing is complete", function() {
        it("an element becomes again editable-was",function() {
          // first there is a mountain
          var expected_tag =  $(selector).filter(':first').get(0).tagName
          expect($(selector).filter(expected_tag).size()).toBe(1)
          $(selector).filter(':first').trigger('click.editable')
          // then there is no  mountain
          expect($(selector).filter(expected_tag).size()).toBe(0)
          $(selector).filter(':first').trigger('blur.editable')
          // then there is
          expect($(selector).filter(expected_tag).size()).toBe(1)
        })
        it("the input value becomes the CDATA",function () {
          $(selector).filter(':first').text("SOUP")
          $(selector).filter(':first').trigger('click.editable')
          expect($(selector).filter(':first').val()).toEqual("SOUP")
          $(selector).filter(':first').val("are you a kitty?")
          $(selector).filter(':first').trigger('blur.editable')
          expect($(selector).filter(':first').text()).toEqual("are you a kitty?")

        })
      })
      describe("hover event handler", function() {
        it("turns on editable hover class",function() {
          expect($(selector).filter(':first').hasClass('editable-hover')).toBeFalsy()
          $(selector).filter(':first').trigger('mouseover.editable')
          expect($(selector).filter(':first').hasClass('editable-hover')).toBeTruthy()
        })
        it("turns off editable hover class",function() {
          expect($(selector).filter(':first').hasClass('editable-hover')).toBeFalsy()
          $(selector).filter(':first').trigger('mouseover.editable')
          expect($(selector).filter(':first').hasClass('editable-hover')).toBeTruthy()
          $(selector).filter(':first').trigger('mouseout.editable')
          expect($(selector).filter(':first').hasClass('editable-hover')).toBeFalsy()
        })
      })

      describe("editable life-cycle",function() {

        it("moves from editable to to completed to editable to completed to editable",function() {
          // invariant:
          //  the selector always exists in the dom
          //
          // invariant:
          //  the selector must become and input on click
          //
          expect($(selector).size()).toBe(1)
          expect($(selector).filter(':input').size()).toBe(0)
          $(selector).filter(':first').trigger('click.editable')
          expect($(selector).size()).toBe(1)
          expect($(selector).filter(':input').size()).toBe(1)
          $(selector).filter(':first').trigger('blur.editable')
          expect($(selector).size()).toBe(1)
          expect($(selector).filter(':input').size()).toBe(0)
          $(selector).filter(':first').trigger('click.editable')
          expect($(selector).size()).toBe(1)
          expect($(selector).filter(':input').size()).toBe(1)
          $(selector).filter(':first').trigger('blur.editable')
          expect($(selector).size()).toBe(1)
          expect($(selector).filter(':input').size()).toBe(0)
          $(selector).filter(':first').trigger('click.editable')
          expect($(selector).size()).toBe(1)
          expect($(selector).filter(':input').size()).toBe(1)
        })
      })


      describe("enter key event handler", function() {
        it("triggers complete edit event",function() {
          expect(false).toBeTruthy()
        })
      })
    })
  })

  describe("with multiple matches in dom",function() {
    beforeEach(function(){
      var fixture  = "<div class='phrase'><span id='first' editable-resource-uri='http://s/r/i' class='text'>CAKE1</span></div>"
      fixture += "<div class='phrase'><span id='second' editable-resource-uri='http://s/r/i' class='text'>CAKE2</span></div>"
      fixture += "<div class='phrase'><span id='third' editable-resource-uri='http://s/r/i' class='text'>CAKE3</span></div>"
      setFixtures(fixture)
    });
    describe("with editable declared",function() {
      beforeEach(function() {
        Editable(selector)
      })
      it("has a data editable-index",function() {
        expect($(selector).filter('#first').attr("editable-index")).toEqual('1')
        expect($(selector).filter('#second').attr("editable-index")).toEqual('2')
        expect($(selector).filter('#third').attr("editable-index")).toEqual('3')

      })
      describe("editable life-cycle",function() {
        describe("on editing node there is a keydown handler", function() {
          describe("the tab key",function() {
            it("completes edit and moves to next editable", function () {
              // nothing if focused
              expect($(selector).filter(':focus').size()).toBe(0)
              $(selector).filter(':first').trigger('click.editable')
              // #first becomes focused
              expect($(selector).filter('#first').filter(':focus').size()).toBe(1)
              var e = jQuery.Event("keydown.editable", { keyCode: Editable.TAB_KEY })
              $(selector).filter(':first').trigger(e)

              // #second becomes focused
              expect($(selector).filter('#second').filter(':focus').size()).toBe(1)
              // #second becomes input
              expect($(selector).filter('#second').filter(':input').size()).toBe(1)
            })
            it("moves back to first editable after last", function () {
              expect($(selector).filter(':focus').size()).toBe(0)

              $(selector).filter('#third').trigger('click.editable')
              expect($(selector).filter('#third').filter(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown.editable", { keyCode: Editable.TAB_KEY })
              $(selector).filter('#third').trigger(e)

              expect($(selector).filter('#first').filter(':focus').size()).toBe(1)
              expect($(selector).filter('#first').filter(':input').size()).toBe(1)
            })
          })
          it("other keys do nothing", function () {
            // nothing if focused
            expect($(selector).filter(':focus').size()).toBe(0)
            $(selector).filter(':first').trigger('click.editable')
            // #first becomes focused
            expect($(selector).filter('#first').filter(':focus').size()).toBe(1)
            var e = jQuery.Event("keydown.editable", { keyCode: 99 })
            $(selector).filter(':first').trigger(e)
            // nothing changes - still only one
            expect($(selector).filter(':input').size()).toBe(1)
            // and it is the same one
            expect($(selector).filter('#first').filter(':focus').size()).toBe(1)
          })
        })
      })
    })
  })
})
