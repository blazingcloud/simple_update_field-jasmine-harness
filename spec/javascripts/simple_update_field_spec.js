describe("SimpleUpdateField",function() {
  var selector = '.phrase .text'

  it("it has a constructor", function() {
    expect(SimpleUpdateField).toBeDefined()
    expect(SimpleUpdateField()).toBeDefined()
  })
 
  describe("with a single match in dom",function() {
    var selector_input = '.phrase .text > :input'

    var should_have_a_child_input_after_click =  function() {
      expect($(selector_input)
             .size()
            ).toBe(0)
            $(selector)
            .trigger('click.editable')
            expect($(selector_input)
                   .size()
                  ).toBe(1)
    }

    var should_leave_the_essential_element_the_same = function() {
      var personality  = $(selector).get(0).tagName // essential element as it is
      $(selector)
      .trigger('click.editable')
      expect($(selector).get(0).tagName).toEqual(personality);
    }
    describe("without attribute editable-resource-uri", function() {

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
          SimpleUpdateField(selector)
        })
        describe("error messages in dom",function() {
          it("resource-attribute attribute",function() {

            $(selector)
            .filter(':first')
            .trigger('click.editable')
            $(selector)
            .filter(':first')
            .trigger('blur.editable')

            expect($('.editable-errors')
                   .text()
                  ).toMatch(
                  "expected editable-resource-attribute attribute"
                  )
          })
          it("resource-model attribute",function() {

            $(selector)
            .trigger('click.editable')
            $(selector)
            .trigger('blur.editable')

            expect($('.editable-errors')
                   .text()
                  ).toMatch(
                  "expected editable-resource-model attribute"
                  )
          })
          it("resource-uri attribute",function() {

            $(selector)
            .trigger('click.editable')
            $(selector)
            .trigger('blur.editable')

            expect($('.editable-errors')
                   .text()
                  ).toMatch(
                  "expected editable-resource-uri attribute"
                  )
          })
        })
      })
    })

    describe("with a editable-resource-uri",function() {

      beforeEach(function(){
        var fixture = "<div class='phrase'>"+
          "<span "+
          " editable-resource-uri='http://s/r/i' "+
        " class='text'>CAKE</span>"+
          "</div>"
        setFixtures(fixture)
      });

      describe("constructor returns an object",function() {
        var suf = null
        beforeEach(function() {
          suf = SimpleUpdateField(selector)
        })
        describe("has a method current_input()",function() {
          describe("after a click",function() {
            beforeEach(function(){
              $(selector)
              .trigger('click.editable')
            })
            it("returns a focused input",function() {
              expect(suf.current_input().size()).toBe(1)
              expect(suf.current_input()).toBe($(selector_input))
            })
          })
          describe("without a click",function() {
            it("returns null",function() {
              expect(suf.current_input()).toBeNull()
            })
          })
        })
      })

      it("selector modifies dom",function() {
        SimpleUpdateField(selector)
        expect($(selector).data('editable')).toBeDefined()
      })

      describe("after installation",function() {
        var suf = null;
        beforeEach(function() {
          suf = SimpleUpdateField(selector)
        })

        describe("ajax request is sent",function() {
          beforeEach(function() {
            clearAjaxRequests()
            spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
              var newXhr = new FakeXMLHttpRequest();
              ajaxRequests.push(newXhr);
              return newXhr;
            })
          })
          it("when editing is complete",function() {
            $(selector).attr('editable-resource-uri',"http://cake123/")
            $(selector).attr('editable-resource-model',"phrase")
            $(selector).attr('editable-resource-attribute',"text")

            // become editable
            $(selector).trigger('click.editable')
            // change value whitespace is ignored
            suf.current_input().val("  passion  ")
            suf.current_input().trigger('blur.editable')

            request = mostRecentAjaxRequest()
            console.log(request)
            expect(request).not.toBeNull()
            expect(request.params).toMatch(/phrase%5Btext%5D=passion/)
            expect(request.method).toMatch(/PUT/)
            expect(request.url).toMatch("http://cake123/")
          })
          describe("does not send ajax request",function(){
          it("when there is no change",function() {
            $(selector).trigger('click.editable')
            suf.current_input().trigger('blur.editable')

            request = mostRecentAjaxRequest()
            expect(request).toBeNull()
          })
          it("when the change is whitespace on begining or end",function() {
            $(selector).trigger('click.editable')

            var current_value = suf.current_input().val()
            suf.current_input().val(' ' + current_value + ' ')
            suf.current_input().trigger('blur.editable')

            request = mostRecentAjaxRequest()
            expect(request).toBeNull()
          })
          })
        })

        describe("when editing begins", function() {
          it("element is still the same element", should_leave_the_essential_element_the_same)
          it("has an input",should_have_a_child_input_after_click)
          describe("and the input  ",function() {
            it("has a class of 'editable-input'",function() {
              $(selector).trigger('click.editable')
              expect(suf.current_input().hasClass('editable-input')).toBeTruthy()
            })
            it("stores its text as input value",function() {
              $(selector).text("Lily")
              $(selector).trigger('click.editable')
              expect(suf.current_input().val()).toEqual("Lily")
            })

            it("has a resource uri : editable-resource-uri",function() {
              $(selector).attr('editable-resource-uri','http://11')
              $(selector).trigger('click.editable')
              expect(suf.current_input()
                     .attr('editable-resource-uri')).toBe('http://11')
            })
            it("has a resource name : editable-resource-model",function() {
              $(selector).attr('editable-resource-model','dream')
              $(selector).filter(':first').trigger('click.editable')
              expect(suf.current_input()
                     .attr('editable-resource-model')).toBe('dream')
            })
            it("has a resource attribute : editable-resource-attribute",function() {
              $(selector).attr('editable-resource-attribute','vision')
              $(selector).filter(':first').trigger('click.editable')
              expect(suf.current_input()
                     .attr('editable-resource-attribute')).toBe('vision')
            })
            it("is focused",function() {
              expect($(selector).filter(':focus').size()).toBe(0)
              $(selector).trigger('click.editable')
              expect(suf.current_input().filter(':focus').size()).toBe(1)
            })
          })
        })
        describe("when editing is complete", function() {
          it("the input value becomes the character data of the element",function () {
            $(selector).text("SOUP")
            $(selector).trigger('click.editable')
            expect(suf.current_input().val()).toEqual("SOUP")
            suf.current_input().val("are you a kitty?")
            suf.current_input().trigger('blur.editable')
            expect($(selector).text()).toEqual("are you a kitty?")

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

          it("moves from editable to completed to editable to completed to editable",function() {
            // invariant:
            //  the selector always exists in the dom
            //
            // invariant:
            //  the selector gains a child input on click
            //
            expect($(selector).size()).toBe(1)
            expect($(selector).find(':input').size()).toBe(0)

            $(selector).trigger('click.editable')
            expect($(selector).size()).toBe(1)
            expect($(selector).find(':input').size()).toBe(1)

            suf.current_input().trigger('blur.editable')
            expect($(selector).size()).toBe(1)
            expect($(selector).children().size()).toBe(0)

            $(selector).trigger('click.editable')
            expect($(selector).size()).toBe(1)
            expect($(selector).find(':input').size()).toBe(1)

            suf.current_input().trigger('blur.editable')
            expect($(selector).size()).toBe(1)
            expect($(selector).children().size()).toBe(0)

            $(selector).trigger('click.editable')
            expect($(selector).size()).toBe(1)
            expect($(selector).find(':input').size()).toBe(1)
          })
        })


        describe("escape key", function() {
          beforeEach(function() {
            $(selector).trigger('click.editable')
            // The current input must be set  for the esc event to work
            var e = jQuery.Event("keydown.editable", { keyCode: SimpleUpdateField.ESC_KEY })
            suf.current_input().trigger(e)
          })
          describe("followed by a click",function() {
            it("is an input",should_have_a_child_input_after_click)
          })
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
      var suf = null
      beforeEach(function() {
        suf = SimpleUpdateField(selector)
      })
      it("has a data editable-index",function() {
        expect($(selector).filter('#first').attr("editable-index")).toEqual('0')
        expect($(selector).filter('#second').attr("editable-index")).toEqual('1')
        expect($(selector).filter('#third').attr("editable-index")).toEqual('2')

      })
      describe("editable life-cycle",function() {
        beforeEach( function() {
          // nothing if focused
          expect($(selector).find(':focus').size()).toBe(0)
        })
        describe("on editing node there is a keydown handler", function() {

          describe("the esc key", function() {
            it("returns the input to it's original value without extra whitespace", function () {
              // we have the original text has whitespace 

              var untrimmed_value = '    ...are you a kitty ?... '
              var trimmed_value   = untrimmed_value.trim()

              $(selector).filter('#first').text(untrimmed_value)
              $(selector).filter('#first').trigger('click.editable')

              // triffer ESC event
              var e = jQuery.Event("keydown.editable", { keyCode: SimpleUpdateField.ESC_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').text()).toEqual(trimmed_value)

            })
            it("returns the input to it's original value", function () {
              // we have the original text
              var expected_value = $(selector).filter('#first').text()

              $(selector).filter('#first').trigger('click.editable')

              // modify element value
              suf.current_input().val("are you a kitty?")
              // triffer ESC event
              var e = jQuery.Event("keydown.editable", { keyCode: SimpleUpdateField.ESC_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').text()).toEqual(expected_value)

            })
          })

          describe("the enter key",function() {
            it("completes edit and focuses the next editable", function () {
              $(selector).filter('#first').trigger('click.editable')

              // there should only be one focused
              expect($(selector).filter('#first').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown.editable", { keyCode: SimpleUpdateField.ENTER_KEY })
              suf.current_input().trigger(e)

              // #second becomes focused
              expect($(selector).filter('#second').find(':focus').size()).toBe(1)
              // #second becomes input
              expect($(selector).filter('#second').find(':input').size()).toBe(1)
            })
            it("moves focus back to first editable after last", function () {

              $(selector).filter('#third').trigger('click.editable')
              expect($(selector).filter('#third').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown.editable", { keyCode: SimpleUpdateField.ENTER_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').find(':focus').size()).toBe(1)
              expect($(selector).filter('#first').find(':input').size()).toBe(1)
            })
          })
          describe("the tab key",function() {
            it("completes edit and moves focus to next editable", function () {
              // #first becomes focused
              $(selector).filter('#first').trigger('click.editable')
              // sanity check
              expect($(selector).filter('#first').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown.editable", { keyCode: SimpleUpdateField.TAB_KEY })
              suf.current_input().trigger(e)

              // #second becomes focused
              expect($(selector).filter('#second').find(':focus').size()).toBe(1)
              // #second becomes input
              expect($(selector).filter('#second').find(':input').size()).toBe(1)
            })
            it("moves focus back to first editable after last", function () {

              $(selector).filter('#third').trigger('click.editable')
              expect($(selector).filter('#third').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown.editable", { keyCode: SimpleUpdateField.TAB_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').find(':focus').size()).toBe(1)
              expect($(selector).filter('#first').find(':input').size()).toBe(1)
            })
          })
          it("other keys do nothing to the focus", function () {
            $(selector).filter(':first').trigger('click.editable')
            // #first becomes focused
            expect($(selector).filter('#first').find(':focus').size()).toBe(1)
            var e = jQuery.Event("keydown.editable", { keyCode: 99 })
            suf.current_input().trigger(e)
            // nothing changes - still only one
            expect($(selector).find(':input').size()).toBe(1)
            // and it is the same one
            expect($(selector).filter('#first').find(':focus').size()).toBe(1)
          })
        })
      })
    })
  })
})
