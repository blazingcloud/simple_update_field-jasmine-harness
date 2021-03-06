describe("SimpleUpdateField",function() {
  var selector = '.phrase .text'

  it("is IE ",function() {
    if (navigator.appName == 'Microsoft Internet Explorer') {
        alert("this test-harness has not yet found a way to work with the focus pseudo selector on ie")
    }
  })

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
            .trigger('click')
            expect($(selector_input)
                   .size()
                  ).toBe(1)
    }

    var should_leave_the_essential_element_the_same = function() {
      var personality  = $(selector).get(0).tagName // essential element as it is
      $(selector)
      .trigger('click')
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
            .trigger('click')
            $(selector)
            .filter(':first')
            .trigger('complete.editable')

            expect($('.editable-errors')
                   .text()
                  ).toMatch(
                  "expected editable-resource-attribute attribute"
                  )
          })
          it("resource-model attribute",function() {

            $(selector)
            .trigger('click')
            $(selector)
            .trigger('complete.editable')

            expect($('.editable-errors')
                   .text()
                  ).toMatch(
                  "expected editable-resource-model attribute"
                  )
          })
          it("resource-uri attribute",function() {

            $(selector)
            .trigger('click')
            $(selector)
            .trigger('complete.editable')

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
              .trigger('click')
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
      describe("after installation with callbacks", function() {
        beforeEach(function() {

          // SimpleUpdateField annotations for doing updates
          $(selector).attr('editable-resource-uri',"http://cake123/")
          $(selector).attr('editable-resource-model',"phrase")
          $(selector).attr('editable-resource-attribute',"text")


          clearAjaxRequests()
          spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
            var newXhr = new FakeXMLHttpRequest();
            ajaxRequests.push(newXhr);
            return newXhr;
          })
        })
        it("before_update callback runs ",function() {
          var callback_ran = false
          suf = SimpleUpdateField(selector, { before_update: function() {
            callback_ran = true
            return true 
          }})
          $(selector).trigger('click')
          suf.current_input().val("  passion  ")
          suf.current_input().trigger('complete.editable')

          expect(callback_ran).toBeTruthy()
        })
        it("before_update callback has 'this' bound to the input ",function() {
          var callback_this
          suf = SimpleUpdateField(selector, { before_update: function() {
            callback_this = this
            return true 
          }})
          $(selector).trigger('click')
          suf.current_input().val("  passion  ")

          var input = suf.current_input().get(0)
          suf.current_input().trigger('complete.editable')

          expect(callback_this).toBe(input)
        })
        describe("before_update callback", function() {
          it("that returns true cause appropriate ajax request ",function() {
            suf = SimpleUpdateField(selector, { before_update: function() {
              return true 
            }})


            $(selector).trigger('click')
            suf.current_input().val("  passion  ")
            suf.current_input().trigger('complete.editable')

            var request = mostRecentAjaxRequest()
            expect(request).not.toBeNull()

          })
          it("that returns false restores dom to non",function() {
            suf = SimpleUpdateField(selector, { before_update: function() {
              return false
            }})

            $(selector).trigger('click')
            suf.current_input().val("  passion  ")
            suf.current_input().trigger('complete.editable')

            var request = mostRecentAjaxRequest()
            expect(request).toBeNull()

          })
          it("that returns false doesn't do ajax request",function() {
            suf = SimpleUpdateField(selector, { before_update: function() {
              return false
            }})

            $(selector).trigger('click')
            suf.current_input().val("  passion  ")
            suf.current_input().trigger('complete.editable')

            var request = mostRecentAjaxRequest()
            expect(request).toBeNull()

          })
          it("that returns false rollback changes",function() {
            suf = SimpleUpdateField(selector, { before_update: function() {
              return false
            }})

            var original_text = $(selector).text()

            $(selector).trigger('click')

            suf.current_input().val("  passion  ")
            suf.current_input().trigger('complete.editable')

            expect($(selector).text()).toEqual(original_text)

          })
        })
      })
      describe("after installation with ajax spy",function() {
        var suf = null;
        beforeEach(function() {
          suf = SimpleUpdateField(selector)
          clearAjaxRequests()
          spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
            var newXhr = new FakeXMLHttpRequest();
            ajaxRequests.push(newXhr);
            return newXhr;
          })
        })
        describe("ajax request is sent",function() {
          beforeEach(function() {

            $(selector).attr('editable-resource-uri',"http://cake123/")
            $(selector).attr('editable-resource-model',"phrase")
            $(selector).attr('editable-resource-attribute',"text")
            // become editable
            $(selector).trigger('click')

          })

          var ajax_request_should_be_sent = function() {

            // change value whitespace is ignored
            suf.current_input().val("  passion  ")
            suf.current_input().trigger('complete.editable')

            var request = mostRecentAjaxRequest()
            expect(request).not.toBeNull()
            expect(request.params).toMatch(/phrase%5Btext%5D=passion/)
            expect(request.method).toMatch(/PUT/)
            expect(request.url).toMatch("http://cake123/")

          }
        })

        describe("does not send ajax request",function(){

          it("when there is no change",function() {
            $(selector).trigger('click')
            suf.current_input().trigger('complete.editable')

            var request = mostRecentAjaxRequest()
            expect(request).toBeNull()
          })
          it("when the change is whitespace on begining or end",function() {
            $(selector).trigger('click')

            var current_value = suf.current_input().val()
            suf.current_input().val(' ' + current_value + ' ')
            suf.current_input().trigger('complete.editable')

            var request = mostRecentAjaxRequest()
            expect(request).toBeNull()
          })
        })

        describe("when editing begins", function() {
          it("element is still the same element", should_leave_the_essential_element_the_same)
          it("has an input",should_have_a_child_input_after_click)
          describe("and the input generated by a click",function() {
            it("has a class of 'editable-input'",function() {
              $(selector).trigger('click')
              expect(suf.current_input().hasClass('editable-input')).toBeTruthy()
            })
            it("stores its text as input value",function() {
              $(selector).text("Lily")
              $(selector).trigger('click')
              expect(suf.current_input().val()).toEqual("Lily")
            })

            it("has a resource uri : editable-resource-uri",function() {
              $(selector).attr('editable-resource-uri','http://11')
              $(selector).trigger('click')
              expect(suf.current_input()
                     .attr('editable-resource-uri')).toBe('http://11')
            })
            it("has a resource name : editable-resource-model",function() {
              $(selector).attr('editable-resource-model','dream')
              $(selector).filter(':first').trigger('click')
              expect(suf.current_input()
                     .attr('editable-resource-model')).toBe('dream')
            })
            it("has a resource attribute : editable-resource-attribute",function() {
              $(selector).attr('editable-resource-attribute','vision')
              $(selector).filter(':first').trigger('click')
              expect(suf.current_input()
                     .attr('editable-resource-attribute')).toBe('vision')
            })
            it("is focused",function() {
              expect($(selector).filter(':focus').size()).toBe(0)
              $(selector).trigger('click')
              expect(suf.current_input().filter(':focus').size()).toBe(1)
            })
            it("doesn't get changed when clicked twice",function() {
              // bugfix https://www.pivotaltracker.com/story/show/29079947
              var expected_text = $(selector).text()
              $(selector).trigger('click') // first click to generate input
              $(selector).trigger('click') // second click
              expect(suf.current_input().val()).toEqual(expected_text)
            })

          })
        })
        describe("when editing is complete", function() {
          it("the input value becomes the character data of the element",function () {
            $(selector).text("SOUP")
            $(selector).trigger('click')
            expect(suf.current_input().val()).toEqual("SOUP")
            suf.current_input().val("are you a kitty?")
            suf.current_input().trigger('complete.editable')
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

            $(selector).trigger('click')
            expect($(selector).size()).toBe(1)
            expect($(selector).find(':input').size()).toBe(1)

            suf.current_input().trigger('complete.editable')
            expect($(selector).size()).toBe(1)
            expect($(selector).children().size()).toBe(0)

            $(selector).trigger('click')
            expect($(selector).size()).toBe(1)
            expect($(selector).find(':input').size()).toBe(1)

            suf.current_input().trigger('complete.editable')
            expect($(selector).size()).toBe(1)
            expect($(selector).children().size()).toBe(0)

            $(selector).trigger('click')
            expect($(selector).size()).toBe(1)
            expect($(selector).find(':input').size()).toBe(1)
          })
        })


        describe("escape key", function() {
          beforeEach(function() {
            $(selector).trigger('click')
            // The current input must be set  for the esc event to work
            var e = jQuery.Event("keydown", { keyCode: SimpleUpdateField.ESC_KEY })
            suf.current_input().trigger(e)
          })
          describe("followed by a click",function() {
            it("is an input",should_have_a_child_input_after_click)
          })
        })
      })
    })
  })

  describe("with two matches for two seperate selectors",function() {
    beforeEach(function(){
      var fixture  = "<div class='phrase'><span id='text-first' editable-resource-uri='http://s/r/i' class='text'>CAKE1</span></div>"
      fixture += "<div class='phrase'><span id='text-second' editable-resource-uri='http://s/r/i' class='text'>CAKE2</span></div>"
      fixture += "<div class='phrase'><span id='id-first' editable-resource-uri='http://s/r/i' class='id'>CAMEL</span></div>"
      fixture += "<div class='phrase'><span id='id-second' editable-resource-uri='http://s/r/i' class='id'>OWL</span></div>"
      setFixtures(fixture)
    });
    describe("and two of SimpleUpdateField ",function(){
      var second_suf = null
      beforeEach(function() {
        SimpleUpdateField('.phrase .text')
        second_suf = SimpleUpdateField('.phrase .id')
      })
      it('all elements of phrase class should have class : suf-editable',function() {
        $('.phrase .text,.phrase .id').each(function(i,el) {
          expect($(el)).toHaveClass('suf-editable')
        })
      })

      it('upon clicking a node has class : suf-editable-active',function() {
        var $el = $('#id-first')
        $el.trigger('click')
        expect($el).toHaveClass('suf-editable-active')
      })
      describe('with a clicked node',function(){
        var $clicked_node = null
        beforeEach(function() {
          $clicked_node = $('#id-first')
          $clicked_node.trigger('click')
        })
        it('clicking a new node in seperate selector group has class : suf-editable-active',function() {
          var $el = $('#text-second')
          $el.trigger('click')
          expect($el).toHaveClass('suf-editable-active')
        })
        it('original node does not have class : suf-editable-active',function() {
          var $el = $('#text-second')
          $el.trigger('click')
          expect($clicked_node).not.toHaveClass('suf-editable-active')
        })
        it('clicking a new node in the same group should only allow one active input at a time',function() {
          expect($('.phrase .id > input').length).toBe(1)

          var $el = $('#id-second')
          $el.trigger('click')
          expect($('.phrase .id > input').length).toBe(1)
        })
        it('clicking a new node in seperate selector suf should only allow one active input at a time across all',function() {
          expect($('.phrase .id > input, .phrase .text > input').length).toBe(1)

          var $el = $('#text-second')
          $el.trigger('click')
          expect($('.phrase .id > input, .phrase .text > input').length).toBe(1)
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
              var trimmed_value   = $.trim(untrimmed_value)

              $(selector).filter('#first').text(untrimmed_value)
              $(selector).filter('#first').trigger('click')

              // triffer ESC event
              var e = jQuery.Event("keydown", { keyCode: SimpleUpdateField.ESC_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').text()).toEqual(trimmed_value)

            })
            it("returns the input to it's original value", function () {
              // we have the original text
              var expected_value = $(selector).filter('#first').text()

              $(selector).filter('#first').trigger('click')

              // modify element value
              suf.current_input().val("are you a kitty?")
              // triffer ESC event
              var e = jQuery.Event("keydown", { keyCode: SimpleUpdateField.ESC_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').text()).toEqual(expected_value)

            })
          })

          describe("the enter key",function() {
            it("completes edit and focuses the next editable", function () {
              $(selector).filter('#first').trigger('click')

              // there should only be one focused
              expect($(selector).filter('#first').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown", { keyCode: SimpleUpdateField.ENTER_KEY })
              suf.current_input().trigger(e)

              // #second becomes focused
              expect($(selector).filter('#second').find(':focus').size()).toBe(1)
              // #second becomes input
              expect($(selector).filter('#second').find(':input').size()).toBe(1)
            })
            it("moves focus back to first editable after last", function () {

              $(selector).filter('#third').trigger('click')
              expect($(selector).filter('#third').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown", { keyCode: SimpleUpdateField.ENTER_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').find(':focus').size()).toBe(1)
              expect($(selector).filter('#first').find(':input').size()).toBe(1)
            })
          })
          describe("the tab key",function() {
            it("completes edit and moves focus to next editable", function () {
              // #first becomes focused
              $(selector).filter('#first').trigger('click')
              // sanity check
              expect($(selector).filter('#first').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown", { keyCode: SimpleUpdateField.TAB_KEY })
              suf.current_input().trigger(e)

              // #second becomes focused
              expect($(selector).filter('#second').find(':focus').size()).toBe(1)
              // #second becomes input
              expect($(selector).filter('#second').find(':input').size()).toBe(1)
            })
            it("moves focus back to first editable after last", function () {

              $(selector).filter('#third').trigger('click')
              expect($(selector).filter('#third').find(':focus').size()).toBe(1)

              var e = jQuery.Event("keydown", { keyCode: SimpleUpdateField.TAB_KEY })
              suf.current_input().trigger(e)

              expect($(selector).filter('#first').find(':focus').size()).toBe(1)
              expect($(selector).filter('#first').find(':input').size()).toBe(1)
            })
          })
          it("other keys do nothing to the focus", function () {
            $(selector).filter(':first').trigger('click')
            // #first becomes focused
            expect($(selector).filter('#first').find(':focus').size()).toBe(1)
            var e = jQuery.Event("keydown", { keyCode: 99 })
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
