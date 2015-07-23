var Color = { blue: 'blue' }


var world = [{x: 10, y: 20, type: 'Circle', radius: 10, colour: Color.blue}];

 bonsai.run(document.getElementById('world'), {
    code: function() {
      new Rect(10, 10, 100, 100)
        .addTo(stage)
        .attr('fillColor', 'green');
        console.log('tests');
    },
    width: 500,
    height: 400
  });


