// Generated by CoffeeScript 1.4.0
(function() {
  var Carousel, Gallery, Image, ImageView;

  $(document).ready(function() {
    var carousel, gallery, gallery_images, images, iviews;
    images = [];
    iviews = [];
    _.each($(".thumb"), function(o, i) {
      var image, iview;
      o.draggable = false;
      image = new Backbone.Model({
        url: o.getAttribute("src")
      });
      images.push(image);
      iview = new ImageView({
        el: o,
        index: i
      });
      return iviews.push(iview);
    });
    gallery_images = new Backbone.Collection(images);
    gallery = new Gallery({
      collection: gallery_images,
      el: $("#image-list")
    });
    $(".thumb").mousedown(function(e) {
      return e.preventDefault();
    });
    $(".thumb").click(function(e) {
      return e.preventDefault();
    });
    carousel = new Carousel({
      el: $("#big-image-container"),
      collection: gallery_images
    });
    return _.each(iviews, function(v) {
      return v.carousel = carousel;
    });
  });

  Image = Backbone.Collection.extend({
    initialize: function() {
      return this.angle = 0;
    },
    rotateRight: function() {
      this.angle += 90;
      return this.trigger("rotated");
    },
    rotateLeft: function() {
      this.angle -= 90;
      return this.trigger("rotated");
    }
  });

  ImageView = Backbone.View.extend({
    initialize: function() {
      this.index = this.options.index;
      this.record = false;
      this.points = [];
      return this.dollar = new DollarRecognizer();
    },
    events: {
      "mousedown": "onMousedown",
      "mouseup": "onMouseup",
      "mousemove": "onMousemove"
    },
    onMousedown: function() {
      this.record = true;
      return this.points = [];
    },
    onMouseup: function(e) {
      var result;
      this.record = false;
      if (this.points.length > 5) {
        result = this.dollar.Recognize(this.points, false);
        console.log(result.Name);
        $(".alert").hide();
        if (result.Name === "zoom") {
          $("#gallery").hide();
          $("#carousel").show();
          this.carousel.current = this.index;
          this.carousel.render();
          return e.stopPropagation();
        } else {
          $(".alert").show();
          return $(".alert").html("Unrecognized gesture. Please try again");
        }
      }
    },
    onMousemove: function(e) {
      if (this.record) {
        return this.points.push(new Point(e.offsetX, e.offsetY));
      }
    },
    onClick: function(e) {
      return e.preventDefault();
    }
  });

  Gallery = Backbone.View.extend({
    initialize: function() {
      this.record = false;
      this.points = [];
      return this.dollar = new DollarRecognizer();
    },
    events: {
      "mousedown": "onMousedown",
      "mouseup": "onMouseup",
      "mousemove": "onMousemove"
    },
    onMousedown: function() {
      this.record = true;
      return this.points = [];
    },
    onMouseup: function(e) {
      var result;
      this.record = false;
      return result = this.dollar.Recognize(this.points, false);
    },
    onMousemove: function(e) {
      if (this.record) {
        return this.points.push(new Point(e.offsetX, e.offsetY));
      }
    },
    render: function() {
      var html;
      html = "";
      this.collection.each(function(image) {
        return html += "<li>\n<img src=\"" + (image.get("url")) + "\" class=\"thumb\">\n</li>";
      });
      $(this.el).html(html);
      $(".thumb").click(function(e) {
        return e.preventDefault();
      });
      return _.each($(".thumb"), function(o) {
        return o.draggable = false;
      });
    }
  });

  Carousel = Backbone.View.extend({
    initialize: function() {
      this.current = 0;
      this.points = [];
      this.record = false;
      this.$("#big-image")[0].draggable = false;
      this.dollar = new DollarRecognizer();
      return this.magnified = false;
    },
    events: {
      "mousedown #big-image": "onMousedown",
      "mouseup #big-image": "onMouseup",
      "mousemove #big-image": "onMousemove"
    },
    onMousedown: function(e) {
      this.record = true;
      return this.points = [];
    },
    onMouseup: function(e) {
      var result;
      this.record = false;
      if (this.points.length > 5) {
        $(".alert").hide();
        result = this.dollar.Recognize(this.points, false);
        console.log(result.Name);
        if (result.Name === "forward") {
          this.forward();
          this.render();
        } else if (result.Name === "backward") {
          this.backward();
          this.render();
        } else if (result.Name === "zoom") {
          $("#carousel").hide();
          $("#gallery").show();
        } else if (result.Name === "magnify") {
          if (this.magnified) {
            this.zoomOut();
          } else {
            this.zoomIn();
          }
          this.magnified = !this.magnified;
        } else if (result.Name === "forward2") {
          this.forward();
          this.forward();
          this.render();
        } else if (result.Name === "backward2") {
          this.backward();
          this.backward();
          this.render();
        } else {
          $(".alert").show();
          $(".alert").html("Unrecognized gesture, please try again");
        }
        e.stopPropagation();
        return false;
      }
    },
    onMousemove: function(e) {
      if (this.record) {
        return this.points.push(new Point(e.offsetX, e.offsetY));
      }
    },
    forward: function() {
      if (this.current === this.collection.size() - 1) {
        return this.current = 0;
      } else {
        return this.current++;
      }
    },
    backward: function() {
      if (this.current === 0) {
        return this.current = this.collection.size() - 1;
      } else {
        return this.current--;
      }
    },
    render: function() {
      return this.$("#big-image").attr("src", this.collection.models[this.current].get("url"));
    },
    zoomIn: function() {
      return this.$("#big-image").css({
        "-ms-transform": "scale(2)",
        "-moz-transform": "scale(2)",
        "-webkit-transform": "scale(2)",
        "-o-transform": "scale(2)"
      });
    },
    zoomOut: function() {
      return this.$("#big-image").css({
        "-ms-transform": "scale(1)",
        "-moz-transform": "scale(1)",
        "-webkit-transform": "scale(1)",
        "-o-transform": "scale(1)"
      });
    }
  });

}).call(this);
