Editable = function(selector) {
  var self = this
  self.selector = selector

  var replace_tag_from = function(tag_name,node) {
    var elem = $('<'+tag_name+'/>');
    elem.attr('class',node.attr('class'))
    elem.attr('id',node.attr('id'))
    elem.attr('editable-index',node.attr('editable-index'))
    elem.data(node.data())
    elem.data('editable-was',node.get(0).tagName)
    node.replaceWith(function() {
      return elem
    })
    return elem
  }

  var replace_input_from = function(node) {
    var element = replace_tag_from('input',node)
    element.val(node.text())
    return element
  }

  self.begin_edit_event = function(event) {
      var clicked_node = $(this);
      var new_node = replace_input_from(clicked_node);
      install_edit_complete_notions(new_node)
      new_node.focus();
  }
  var is_blur_tab_redirect = function () {
    if (self.last_keydown_event) {
      if (self.last_keydown_event.keyCode == Editable.TAB_KEY) {
        return true
      }
    }
    return false
  }
  var move_to_next_sibling = function(element) {
    if(element.attr('editable-index')) {
      var next_position = parseInt(element.attr('editable-index')) +1
      var next_editable = $(selector).filter('[editable-index='+next_position+']')
      if (next_editable.size() == 0) {
        next_editable = $(selector).filter('[editable-index=1]')
      }
      next_editable.trigger('click.editable')
    }else {
      throw 'Expected to be able to assign custom attribute editable-index'
    }
  }
  self.complete_edit_event = function(event) {

    var finished_node = $(this)
    var element = replace_tag_from(finished_node.data('editable-was'),finished_node)
    element.text(finished_node.val())
    install_edit_notions(element)
    
    // If tab key was hit during the edit phase
    // we want to redirect this blur to be a click on the next
    // sibling
    if(is_blur_tab_redirect()) {
      move_to_next_sibling(element)
    }

    // Cleanup - cross event state
    // there was no last keydown event
    self.last_keydown_event = undefined;
  }
  
  var install_edit_notions = function(selector) {

    $(selector).bind('click.editable',begin_edit_event)
    $(selector).bind('mouseover.editable',function() {
      $(this).addClass('editable-hover')
    })

    $(selector).bind('mouseout.editable',function() {
      $(this).removeClass('editable-hover')
    })
  }

  var install_edit_complete_notions = function (selector) {

    $(selector).bind('keydown.editable',function(e) {
      self.last_keydown_event = e
      if(is_blur_tab_redirect()) {
        $(this).trigger('blur.editable')
        return false; // manually handle tab - no event propigation
      }
        return true; // allow default propigation
    })

    $(selector).bind('blur.editable',complete_edit_event)
  }
  var annotate_editable_with_position = function(selector) {
    $(selector).each(function(i,el) {
      $(el).attr('editable-index',i+1)
    })
  }
  
  install_edit_notions(selector)
  annotate_editable_with_position(selector)

  $(selector).data('editable','installed')
  return self;
}
Editable.TAB_KEY = 9 // tab is #9
