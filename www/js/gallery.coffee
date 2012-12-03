$(document).ready ->
  images = []
  iviews = []
  _.each $(".thumb"), (o, i) ->
    o.draggable = false
    image = new Backbone.Model
      url: o.getAttribute "src"
    images.push image
    iview = new ImageView
      el: o,
      index: i
    iviews.push iview
  gallery_images = new Backbone.Collection images
  gallery = new Gallery
    collection: gallery_images
    el: $("#image-list")

  $(".thumb").mousedown (e) ->
    e.preventDefault()

  $(".thumb").click (e) ->
    e.preventDefault()

  carousel = new Carousel
    el: $("#big-image-container")
    collection: gallery_images

  _.each iviews, (v) ->
    v.carousel = carousel

Image = Backbone.Collection.extend
  initialize: ->
    @angle = 0

  rotateRight: ->
    @angle += 90
    @trigger "rotated"

  rotateLeft: ->
    @angle -= 90
    @trigger "rotated"

ImageView = Backbone.View.extend
  initialize: ->
    @index = @options.index
    @record = false
    @points = []
    @dollar = new DollarRecognizer()

  events:
    "mousedown": "onMousedown"
    "mouseup": "onMouseup"
    "mousemove": "onMousemove"

  onMousedown: ->
    @record = true
    @points = []

  onMouseup: (e) ->
    @record = false
    if @points.length > 5
      result = @dollar.Recognize(@points, false)
      console.log result.Name
      $(".alert").hide()
      if result.Name == "zoom"
        $("#gallery").hide()
        $("#carousel").show()
        @carousel.current = @index
        @carousel.render()
        e.stopPropagation()
      else
        $(".alert").show()
        $(".alert").html "Unrecognized gesture. Please try again"

  onMousemove: (e) ->
    if @record
      @points.push new Point(e.offsetX, e.offsetY)


  onClick: (e) ->
    e.preventDefault()

Gallery = Backbone.View.extend
  initialize: ->
    @record = false
    @points = []
    @dollar = new DollarRecognizer()

  events:
    "mousedown": "onMousedown"
    "mouseup": "onMouseup"
    "mousemove": "onMousemove"

  onMousedown: ->
    @record = true
    @points = []

  onMouseup: (e) ->
    @record = false
    result = @dollar.Recognize(@points, false)
    #    console.log _.map @points, (point) ->
    #      "new Point(#{point.X}, #{point.Y})"
  
  onMousemove: (e) ->
    if @record
      @points.push new Point(e.offsetX, e.offsetY)

  render: ->
    html = ""
    @collection.each (image) ->
      html += "<li>\n<img src=\"#{image.get("url")}\" class=\"thumb\">\n</li>"
    $(@el).html html
    $(".thumb").click (e) ->
      e.preventDefault()
    _.each $(".thumb"), (o) ->
      o.draggable = false

Carousel = Backbone.View.extend
  initialize: ->
    @current = 0
    @points = []
    @record = false
    @$("#big-image")[0].draggable = false
    @dollar = new DollarRecognizer()
    @magnified = false

  events:
    "mousedown #big-image": "onMousedown"
    "mouseup #big-image": "onMouseup"
    "mousemove #big-image": "onMousemove"

  onMousedown: (e) ->
    @record = true
    @points = []

  onMouseup: (e) ->
    @record = false
    if @points.length > 5
      $(".alert").hide()
      result = @dollar.Recognize(@points, false)
      #      console.log _.map @points, (point) ->
      #        "new point(#{point.x}, #{point.y})"
      console.log result.Name
      if result.Name == "forward"
        @forward()
        @render()
      else if result.Name == "backward"
        @backward()
        @render()
      else if result.Name == "zoom"
        $("#carousel").hide()
        $("#gallery").show()
      else if result.Name == "magnify"
        if @magnified then @zoomOut() else @zoomIn()
        @magnified = !@magnified
      else if result.Name == "forward2"
        @forward()
        @forward()
        @render()
      else if result.Name == "backward2"
        @backward()
        @backward()
        @render()
      else
        $(".alert").show()
        $(".alert").html "Unrecognized gesture, please try again"
      e.stopPropagation()
      false

  onMousemove: (e) ->
    if @record
      @points.push new Point(e.offsetX, e.offsetY)

  forward: ->
    if @current == @collection.size() - 1
      @current = 0
    else
      @current++

  backward: ->
    if @current == 0
      @current = @collection.size() - 1
    else
      @current--

  render: ->
    @$("#big-image").attr "src", @collection.models[@current].get("url")
    

  zoomIn: ->
    @$("#big-image").css
      "-ms-transform": "scale(2)",
      "-moz-transform": "scale(2)",
      "-webkit-transform": "scale(2)",
      "-o-transform": "scale(2)"

  zoomOut: ->
    @$("#big-image").css
      "-ms-transform": "scale(1)",
      "-moz-transform": "scale(1)",
      "-webkit-transform": "scale(1)",
      "-o-transform": "scale(1)"

