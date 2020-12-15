/////////////////////////////////////////////////////////////////////////////////////////////////
//----------------------------VARIABLES DEL SCATTER PLOT----------------------------------------
// Variables para los tres canales
// Objeto con los datos a representar
var datos
var datos_2019
var datos_2020
// variables de configuración de la app
var width = 1000
var width = 700
var height = 500
var margin = {
  top: 70,
  right: 40,
  bottom: 80,
  left: 60
};
var varX = 'x_2018';
var varY = 'y_2018';
var varZ = 'Real_2018';
var varX_2019 = 'x_2019'
var varY_2019 = 'y_2019'
var my_data = []
var variables
var year = ['Año 2018', 'Año 2019', 'Año 2020']
var last_day = 1;
var last_month = 1;
var formatSave_Day = d3.timeFormat("%H:%M");
// Coordenadas base para los meses del año (layout 12 meses)
var x = 90;
var y = 40;

// Ejes
var xAxis_scatter, yAxis_scatter

// Escalas
var eX, eY

// Texto de los meses
var text1 = []
var text2 = []
var path;
var keys;
var datos_gen = [];
var pie;
var category;


/////////////////////////////////////////////////////////////////////////////////////////////////
//----------------------------VARIABLES DEL GRAFICO DE LINEAS-----------------------------------
var margin_chart = {
    top: 20,
    right: 40,
    bottom: 20,
    left: 50
  },
  width_chart = 470 - margin_chart.left - margin_chart.right,
  height_chart = 200 - margin_chart.top - margin_chart.bottom;
var parseDate = d3.timeParse("%Y-%m-%d %H:%M"),
  formatDate = d3.timeFormat("%H:%M"),
  bisectDate = d3.bisector(function(d) {
    return d.fecha;
  }).left;
var real_active = true;
var prevista_active = true;
var programada_active = true;
var data_plot = [];
var data_parsed = [];
var yAxis_linechart;
var xAxis_linechart;
var line_real;
var line_prevista;
var line_programada;
var line_non_r;
var area_non_r;
var turn_non_r = false;
var line_ren;
var area_ren;
var turn_ren = false;
var svg_lineplot;
var label_precipitaciones;
var label_temperatura;
var data_donut = [];
var date_text;
var formatDate_selection = d3.timeFormat("%Y-%m-%d");
var turn_fecha = '2018';
// Funcion para obtener key de un dataset
function key(d) {
  return d.data[category];
}


////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------REPRESENTACION DEL DONUT-----------------------------------------//
// Adaptación del ejemplo de Michael Hall : https://bl.ocks.org/mbhall88/22f91dc6c9509b709defde9dc29c63f2
d3.csv('Dataset_Total.csv', function(error, data) {
  var chartDiv = document.getElementById("donut");
  t = chartDiv.clientWidth;
  r = parseInt(d3.select('#donut').style('height'), 10)
  updatecircle(data[0])
  d3.select('#donut').call(donut)

});

var donut = donutChart()
  .width(300)
  .height(200)
  .transTime(750)
  .cornerRadius(6)
  .padAngle(0.015)
  .variable('Cantidad')
  .category('Tipo');

function donutChart() {
  var data = [],
    width,
    height,
    margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 200
    },
    variable,
    category,
    padAngle,
    transTime,
    updateData,
    floatFormat = d3.format('.0r'),
    cornerRadius,
    colorScale = d3.scaleOrdinal().domain(["Eólica", "Nuclear", "Fuel/gas",
      "Carbón", "Ciclo combinado", "Hidráulica",
      "Intercambios int", "Enlace balear", "Solar fotovoltaica",
      "Solar térmica", "Térmica renovable", "Cogeneración y residuos"
    ])
    .range(["#00CD00", "#2E0854", "#2F4F2F",
      "#FF5733", "#FF007F", "#04BFF5",
      "#FD03D0", "#BAA3EB", "#FBF700",
      "#FB0000", "#FB8500", "#FB0050",
    ]);


  function chart(selection) {
    selection.each(function() {
      // Generacion del grafico
      var radius = Math.min(height, width) / 2;
      // Instanciacion del objeto pie
      var pie = d3.pie()
        .value(function(d) {
          return floatFormat(d[variable]);
        })
        .sort(null);

      // Anchura del donut
      var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.6)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle);

      // Se añade el svg
      var svg = selection.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('x', 100)
        .style('transform', 'translate(50%, 50%)')
        .attr('viewBox', (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMinYMin');

      svg.append('g').attr('class', 'slices');

      var path = svg.select('.slices')
        .selectAll('path')
        .data(pie(data))
        .enter().append('path')
        .attr('fill', function(d) {
          return colorScale(d.data[category]);
        })
        .attr('d', arc);

      // Se añade la herramienta tooltip para poder presentar el texto
      d3.selectAll('.labelName text, .slices path').call(toolTip);

      // Función para actualizar el gráfico
      updateData = function() {

        var updatePath = d3.select('.slices').selectAll('path');
        var data0 = path.data(), // store the current data before updating to the new
          data1 = pie(data);
        updatePath = updatePath.data(data1, key);


        // Adición de nuevas slices si las hubiese
        updatePath.enter().append('path')
          .each(function(d, i) {
            this._current = findNeighborArc(i, data0, data1, key) || d;
          })
          .attr('fill', function(d) {
            return colorScale(d.data[category]);
          })
          .attr('d', arc);

        // Quitar las slices que ya no tienen representacion
        updatePath.exit()
          .transition()
          .duration(transTime)
          .attrTween("d", arcTween)
          .remove();

        // Animacion
        updatePath.transition().duration(transTime)
          .attrTween('d', arcTween);

        // ToolTip
        d3.selectAll('.labelName text, .slices path').call(toolTip);

      };
      // ===========================================================================================
      // Funciones
      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }

      // Funcion para crear el tooltip en la slice que se haya seleccionado
      function toolTip(selection) {

        // Basta con pasar el raton por encima de la slice que se desee consultar
        selection.on('mouseenter', function(data) {

          svg.append('text')
            .attr('class', 'toolCircle')
            .attr('font-family', 'calibri')
            .attr('dy', -15)
            .html(toolTipHTML(data))
            .style('font-size', '.75em')
            .style('text-anchor', 'middle')
            .style('fill', 'white');

          svg.append('circle')
            .attr('class', 'toolCircle')
            .attr('r', radius * 0.55)
            .style('fill', colorScale(data.data[category]))
            .style('fill-opacity', 0.35);

        });

        // Al quitar el cursor se quita el tooltip
        selection.on('mouseout', function() {
          d3.selectAll('.toolCircle').remove();
        });
      }

      // Funcion para crear el string HTML para el tooltip.
      function toolTipHTML(data) {
        var tip = '',
          i = 0;
        for (var key in data.data) {
          // Formateado del valor obtenido
          var value = (!isNaN(parseFloat(data.data[key]))) ? data.data[key] : data.data[key];
          if (i === 0) tip += '<tspan x="0">' + value + '</tspan>';
          else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + 'MW' + '</tspan>';
          i++;
        }
        return tip;
      }

      // Funcion para calcular las transiciones de los arcos
      function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      }

      function findNeighborArc(i, data0, data1, key) {
        var d;
        return (d = findPreceding(i, data0, data1, key)) ? {
            startAngle: d.endAngle,
            endAngle: d.endAngle
          } :
          (d = findFollowing(i, data0, data1, key)) ? {
            startAngle: d.startAngle,
            endAngle: d.startAngle
          } :
          null;
      }

      function findPreceding(i, data0, data1, key) {
        var m = data0.length;
        while (--i >= 0) {
          var k = key(data1[i]);
          for (var j = 0; j < m; ++j) {
            if (key(data0[j]) === k) return data0[j];
          }
        }
      }

      function key(d) {
        return d.data[category];
      }

      function findFollowing(i, data0, data1, key) {
        var n = data1.length,
          m = data0.length;
        while (++i < n) {
          var k = key(data1[i]);
          for (var j = 0; j < m; ++j) {
            if (key(data0[j]) === k) return data0[j];
          }
        }
      }
    });
  }

  // Funciones setter y getter
  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  chart.margin = function(value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  chart.radius = function(value) {
    if (!arguments.length) return radius;
    radius = value;
    return chart;
  };

  chart.padAngle = function(value) {
    if (!arguments.length) return padAngle;
    padAngle = value;
    return chart;
  };

  chart.cornerRadius = function(value) {
    if (!arguments.length) return cornerRadius;
    cornerRadius = value;
    return chart;
  };

  chart.colour = function(value) {
    if (!arguments.length) return colour;
    colour = value;
    return chart;
  };

  chart.variable = function(value) {
    if (!arguments.length) return variable;
    variable = value;
    return chart;
  };

  chart.category = function(value) {
    if (!arguments.length) return category;
    category = value;
    return chart;
  };

  chart.transTime = function(value) {
    if (!arguments.length) return transTime;
    transTime = value;
    return chart;
  };

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    if (typeof updateData === 'function') updateData();
    return chart;
  };

  return chart;
}

d3.csv("Dataset_Total.csv", function(error, data) {
  var count = 0;
  for (var c in data) count++
  for (var i = 0; i < count - 1; i++) {
    data_plot[i] = {
      fecha: parseDate(data[i]['Fecha']),
      real: data[i]['Real'],
      programada: data[i]['Programada'],
      prevista: data[i]['Prevista'],
      eolica: data[i]['Eolica'],
      nuclear: data[i]['Nuclear'],
      fuel_gas: data[i]['Fuel/gas'],
      carbon: data[i]['Carbon'],
      ccomb: data[i]['Ciclo combinado'],
      hidraulica: data[i]['Hidraulica'],
      inter: data[i]['Intercambios int'],
      balear: data[i]['Enlace balear'],
      solar_f: data[i]['Solar fotovoltaica'],
      solar_t: data[i]['Solar termica'],
      termica_r: data[i]['Termica renovable'],
      c_res: data[i]['Cogeneracion y resuduos'],
      no_renovable: data[i]['NoRenovables'],
      renovable: data[i]['Renovables']
    }
  };
  // Se representa en primer lugar el 1 de Enero de 2018 (los 144 primeros datos)
  data_parsed = data_plot.slice(0, 24 * 6);

  // Definimos las escalas de los ejes
  max = d3.max(data_parsed, function(d) {
    return d.real;
  });
  min = d3.min(data_parsed, function(d) {
    return d.real;
  })
  minDate = d3.min(data_parsed, function(d) {
    return d.fecha;
  });
  maxDate = d3.max(data_parsed, function(d) {
    return d.fecha;
  });

  // Limites de los ejes
  y = d3.scaleLinear()
    .domain([min - 5000, 40000])
    .range([height_chart, 0]);

  x = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([0, width_chart]);

  yAxis_linechart = d3.axisLeft(y);
  xAxis_linechart = d3.axisBottom(x);

  // Funcion para pintar lineas de grid
  function make_y_gridlines() {
    return d3.axisLeft(y)
      .ticks(5)
  }

  // Objeto SVG para representacion de lineas
  svg_lineplot = d3.select("#chartline")
    .append("svg")
    .attr("width", width_chart + margin_chart.left + margin_chart.right)
    .attr("height", height_chart + margin_chart.top + margin_chart.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")");

  // Indicadores de los valores de demanda real, prevista y programada
  var svg_labels = d3.select("#labels")
    .append("svg")
    .attr("width", width_chart + margin_chart.left + margin_chart.right)
    .attr("height", 125)
    .append("g")
    .attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")");

  var label_real = svg_labels.append('text')
    .attr('class', 'textlabel')
    .attr('id', 'labelreal')
    .text('Real (MW)')
    .attr('x', 40)
    .on('click', function() {
      real_active = !real_active;
      line_real.attr('opacity', +real_active)
    })

  var label_prevista = svg_labels.append('text')
    .attr('class', 'textlabel')
    .text('Prevista (MW)')
    .attr('x', 140)
    .on('click', function() {
      prevista_active = !prevista_active;
      line_prevista.attr('opacity', +prevista_active)
    })

  var label_programada = svg_labels.append('text')
    .attr('class', 'textlabel')
    .text('Programada (MW)')
    .attr('x', 260)
    .on('click', function() {
      programada_active = !programada_active;
      line_programada.attr('opacity', +programada_active)
    })

  var label_real_num = svg_labels.append('text')
    .attr('class', 'valuelabel')
    .attr('id', 'Real')
    .text(data_parsed[0].real)
    .attr('x', 45)
    .attr('y', 30)

  var label_prevista_num = svg_labels.append('text')
    .attr('class', 'valuelabel')
    .attr('id', 'Prevista')
    .text(data_parsed[0].prevista)
    .attr('x', 170)
    .attr('y', 30)

  var label_programda_num = svg_labels.append('text')
    .attr('class', 'valuelabel')
    .attr('id', 'Programada')
    .text(data_parsed[0].programada)
    .attr('x', 300)
    .attr('y', 30)

  var line1 = svg_labels.append("line")
    .attr("x1", 25)
    .attr("y1", 40)
    .attr("x2", 120)
    .attr("y2", 40)
    .attr("stroke-width", 2)
    .attr("stroke", "#FF1493");

  var line2 = svg_labels.append("line")
    .attr("x1", 140)
    .attr("y1", 40)
    .attr("x2", 240)
    .attr("y2", 40)
    .attr("stroke-width", 2)
    .attr("stroke", "#FFD700");

  var line3 = svg_labels.append("line")
    .attr("x1", 260)
    .attr("y1", 40)
    .attr("x2", 390)
    .attr("y2", 40)
    .attr("stroke-width", 2)
    .attr("stroke", "#00FF00");

  var button_nonRen = svg_labels.append("image")
    .attr('x', 110)
    .attr('y', 25)
    .attr('width', 100)
    .attr('height', 100)
    .attr("xlink:href", "Non_R.png")
    .on('click', function() {
      turn_non_r = !turn_non_r;
      plotNonR(turn_non_r, turn_ren);
    })

  var button_Ren = svg_labels.append("image")
    .attr('x', 170)
    .attr('y', 25)
    .attr('width', 100)
    .attr('height', 100)
    .attr("xlink:href", "Renewable.png")
    .on('click', function() {
      turn_ren = !turn_ren;
      plotNonR(turn_non_r, turn_ren);
    })



  date_text = svg_labels.append('text')
    .attr('x', 0)
    .attr('y', 85)
    .text(formatDate_selection(data_parsed[0].fecha))
    .style('fill', 'white')

  // Definicion de las lineas del plot
  line_real = svg_lineplot.append("path")
    .attr('id', 'linereal')
    .data([data_parsed])
    .attr("fill", "none")
    .attr("stroke", "#FF1493")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line().x(function(d) {
        return x(d.fecha);
      })
      .y(function(d) {
        return y(d.real);
      }))

  line_prevista = svg_lineplot.append("path")
    .attr('id', 'lineprevista')
    .data([data_parsed])
    .attr("fill", "none")
    .attr("stroke", "#FFD700")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line().x(function(d) {
        return x(d.fecha);
      })
      .y(function(d) {
        return y(d.prevista);
      }))

  line_programada = svg_lineplot.append("path")
    .attr('id', 'lineprogramada')
    .data([data_parsed])
    .attr("fill", "none")
    .attr("stroke", "#00FF00")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line().x(function(d) {
        return x(d.fecha);
      })
      .y(function(d) {
        return y(d.programada);
      }))

  area_non_r = svg_lineplot.append('path')
    .attr('id', 'areanonr')
    .data([data_parsed])
    .attr('opacity', 0)
    .style('fill', '#C0C0C0')
    .attr('d', d3.area()
      .x(function(d) {
        return x(d.fecha);
      })
      .y0(height_chart)
      .y1(function(d) {
        return y(d.no_renovable);
      }));

  arearen = svg_lineplot.append('path')
    .attr('id', 'arearen')
    .data([data_parsed])
    .attr('opacity', 0)
    .style('fill', 'green')
    .attr('d', d3.area()
      .x(function(d) {
        return x(d.fecha);
      })
      .y0(function(d) {
        return y(d.no_renovable);
      })
      .y1(function(d) {
        return y(d.renovable);
      }));

  // Elementos del tooltip
  var lineSvg = svg_lineplot.append("g");
  var focus = svg_lineplot.append("g")
    .style("display", "none");

  svg_lineplot.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines()
      .tickSize(-width_chart)
      .tickFormat(""))

  // Añadir eje X a SVG
  svg_lineplot.append("g")
    .attr('id', 'ejex')
    .attr("class", "#axiswhite")
    .attr('stroke', 'white')
    .attr('fill', 'white')
    .attr("transform", "translate(0," + height_chart + ")")
    .call(xAxis_linechart);

  // Añadir eje Y a SVG
  svg_lineplot.append("g")
    .attr('id', 'ejey')
    .attr("class", "#axiswhite")
    .attr('stroke', 'white')
    .attr('fill', 'white')
    .call(yAxis_linechart)

  // Linea de focus en eje X
  focus.append("line")
    .attr("class", "x")
    .style("stroke", "white")
    .style("opacity", 1)
    .attr("y1", 0)
    .attr("y2", height_chart);

  // Linea de focus en eje Y
  focus.append("line")
    .attr("class", "y")
    .style("stroke", "white")
    .style("opacity", 1)
    .attr("x1", width_chart)
    .attr("x2", width_chart);

  // Circulo en la insterseccion de las dos lineas anteriores
  focus.append("circle")
    .attr("class", "y")
    .style("fill", "none")
    .style("stroke", "white")
    .attr("r", 4);

  // Añadir un valor en la intereseccion
  focus.append("text")
    .attr("class", "y1")
    .style("stroke", "white")
    .style("opacity", 1)
    .attr("dx", 8)
    .attr("dy", "-.3em");

  focus.append("text")
    .attr("class", "y4")
    .attr("dx", 8)
    .attr("dy", "1em");

  // Captura del movimineto del raton
  svg_lineplot.append("rect")
    .attr("width", width_chart)
    .attr("height", height_chart)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function() {
      focus.style("display", null);
    })
    .on("mouseout", function() {
      focus.style("display", "none");
    })
    .on("mousemove", mousemove);



  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data_parsed, x0, 1),
      d0 = data_parsed[i - 1],
      d1 = data_parsed[i],
      d = x0 - d0.fecha > d1.fecha - x0 ? d1 : d0;
    d3.select('#Real').text(d.real);
    d3.select('#Prevista').text(d.prevista);
    d3.select('#Programada').text(d.programada);
    updatecircle(d)

    focus.select("circle.y")
      .attr("transform",
        "translate(" + x(d.fecha) + "," +
        y(d.real) + ")");

    focus.select("text.y1")
      .attr("transform",
        "translate(" + x(d.fecha) + "," +
        y(d.real) + ")")
      .text(formatDate(d.fecha))
      .style('fill', 'white')
      .style('font-size', '15px');

    focus.select("text.y2")
      .attr("transform",
        "translate(" + x(d.fecha) + "," +
        y(d.real) + ")")
      .text(formatDate(d.fecha))
      .style('fill', 'white')
      .style('font-size', '15px');

    focus.select(".x")
      .attr("transform",
        "translate(" + x(d.fecha) + "," +
        y(d.real) + ")")
      .attr("y2", height_chart - y(d.real));

    focus.select(".y")
      .attr("transform",
        "translate(" + width_chart * -1 + "," +
        y(d.real) + ")")
      .attr("x2", width_chart + width_chart);
  }

  function plotNonR(turn_nonr, turn_ren) {

    if (turn_nonr || turn_ren) {
      y = d3.scaleLinear()
        .domain([0, 40000])
        .range([height_chart, 0]);
      yAxis_linechart = d3.axisLeft(y);
      svg_lineplot.select("#ejey")
        .transition()
        .duration(1000)
        .call(yAxis_linechart);

      d3.select('#linereal')
        .transition()
        .duration(1000)
        .attr("d", d3.line().x(function(d) {
            return x(d.fecha);
          })
          .y(function(d) {
            return y(d.real);
          }))

      d3.select('#lineprevista')
        .transition()
        .duration(1000)
        .attr("d", d3.line().x(function(d) {
            return x(d.fecha);
          })
          .y(function(d) {
            return y(d.prevista);
          }))

      d3.select('#lineprogramada')
        .transition()
        .duration(1000)
        .attr("d", d3.line().x(function(d) {
            return x(d.fecha);
          })
          .y(function(d) {
            return y(d.programada);
          }))



      if (turn_nonr) {
        d3.select('#areanonr')
          .transition()
          .duration(1000)
          .attr('opacity', 1)
          .attr("d", d3.area()
            .x(function(d) {
              return x(d.fecha);
            })
            .y0(height_chart)
            .y1(function(d) {
              return y(d.no_renovable);
            }));
      }

      if (turn_ren) {
        d3.select('#arearen')
          .transition()
          .duration(1000)
          .attr('opacity', 1)
          .attr("d", d3.area()
            .x(function(d) {
              return x(d.fecha);
            })
            .y0(height_chart)
            .y1(function(d) {
              return y(d.renovable);
            }));
      }


    } else {
      y = d3.scaleLinear()
        .domain([min - 5000, 40000])
        .range([height_chart, 0]);
      yAxis_linechart = d3.axisLeft(y);
      svg_lineplot.select("#ejey")
        .transition()
        .duration(1000)
        .call(yAxis_linechart);

      d3.select('#linereal')
        .transition()
        .duration(1000)
        .attr("d", d3.line().x(function(d) {
            return x(d.fecha);
          })
          .y(function(d) {
            return y(d.real);
          }))

      d3.select('#lineprevista')
        .transition()
        .duration(1000)
        .attr("d", d3.line().x(function(d) {
            return x(d.fecha);
          })
          .y(function(d) {
            return y(d.prevista);
          }))

      d3.select('#lineprogramada')
        .transition()
        .duration(1000)
        .attr("d", d3.line().x(function(d) {
            return x(d.fecha);
          })
          .y(function(d) {
            return y(d.programada);
          }))

    }

    if (!turn_nonr) {
      d3.select('#areanonr')
        .transition()
        .duration(1000)
        .attr('opacity', 0)
        .attr("d", d3.area()
          .x(function(d) {
            return x(d.fecha);
          })
          .y0(0)
          .y1(function(d) {
            return y(d.no_renovable);
          }));
    }

    if (!turn_ren) {
      d3.select('#arearen')
        .transition()
        .duration(1000)
        .attr('opacity', 0)
        .attr("d", d3.area()
          .x(function(d) {
            return x(d.fecha);
          })
          .y0(function(d) {
            return y(d.no_renovable);
          })
          .y1(function(d) {
            return y(d.renovable);
          }));
    }

  }
});

function updateplot(input_data) {
  line_real.attr('opacity', 1)
  line_prevista.attr('opacity', 1)
  line_programada.attr('opacity', 1)
  data_parsed = input_data;
  // Actualizar ejes
  max = d3.max(data_parsed, function(d) {
    return d.real;
  });
  min = d3.min(data_parsed, function(d) {
    return d.real;
  })
  minDate = d3.min(data_parsed, function(d) {
    return d.fecha;
  });
  maxDate = d3.max(data_parsed, function(d) {
    return d.fecha;
  });

  date_text.text(formatDate_selection(data_parsed[0].fecha))

  x = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([0, width_chart]);


  y = d3.scaleLinear()
    .domain([min - 5000, 40000])
    .range([height_chart, 0]);

  if (turn_non_r || turn_ren) {
    y = d3.scaleLinear()
      .domain([0, 40000])
      .range([height_chart, 0]);
  }

  var xAxis_linechart = d3.axisBottom(x);
  var yAxis_linechart = d3.axisLeft(y);
  svg_lineplot.select("ejex")
    .call(xAxis_linechart);

  svg_lineplot.select("ejey")
    .call(yAxis_linechart)

  line_real.datum(data_parsed)
    .transition()
    .duration(1000)
    .attr("d", d3.line()
      .x(function(d) {
        return x(d.fecha)
      })
      .y(function(d) {
        return y(+d.real)
      })
    )

  line_prevista.datum(data_parsed)
    .transition()
    .duration(1000)
    .attr("d", d3.line()
      .x(function(d) {
        return x(d.fecha)
      })
      .y(function(d) {
        return y(+d.prevista)
      })
    )

  line_programada.datum(data_parsed)
    .transition()
    .duration(1000)
    .attr("d", d3.line()
      .x(function(d) {
        return x(d.fecha)
      })
      .y(function(d) {
        return y(+d.programada)
      })
    )

  area_non_r.datum(data_parsed)
    .transition()
    .duration(1000)
    .attr('d', d3.area()
      .x(function(d) {
        return x(d.fecha);
      })
      .y0(height_chart)
      .y1(function(d) {
        return y(d.no_renovable);
      }));

  arearen.datum(data_parsed)
    .transition()
    .duration(1000)
    .attr('d', d3.area()
      .x(function(d) {
        return x(d.fecha);
      })
      .y0(height_chart)
      .y1(function(d) {
        return y(d.renovable);
      }));
}


////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------REPRESENTACION DEL SCATTERPLOT-----------------------------------//

d3.csv('Anos_2018_2019.csv', function(d) {
  d3.csv('Ano_2020.csv', function(d2) {
    // Se vierten los datos a variables globales
    datos = d
    datos_2020 = d2

    // Límites de las escalas X, Y, Z (color)
    extentX = d3.extent(datos, function(d) {
      return +d[varX]
    })
    extentY = d3.extent(datos, function(d) {
      return +d[varY]
    })
    extentZ = d3.extent(datos, function(d) {
      return +d[varZ]
    })

    // Dominio de la escala de color
    step = (extentZ[1] - extentZ[0]) / (9.0 - 0.5)
    dominio = d3.range(extentZ[0], extentZ[1] + step, step)

    // Se escoge una escala de color donde el amarillo representa valores bajos y rojo valores altos
    rango = colorbrewer['YlOrRd'][9]

    // Creacion de la escala de color
    c = d3.scaleLinear().domain(dominio).range(rango)


    // Definicion de las escalas x y
    eX = d3.scaleLinear().domain(extentX).range([margin.left, width - margin.right - 100])
    eY = d3.scaleLinear().domain(extentY).range([margin.top, height - margin.bottom])

    // copiamos las escalas eX y eY. eX_ y eY_ tienen el valor actual de las escalas
    eX_ = eX
    eY_ = eY

    // Definicion de los ejes
    xAxis_scatter = d3.axisBottom(eX);
    yAxis_scatter = d3.axisLeft(eY);

    // nombres de las variables
    variables = Object.keys(d[0])

    // Creacion del objeto svg
    svg = d3.select('#scatter') // seleccionamos el nodo contenedor ('body')
      .append('svg') // añadimos nodo svg
      .attr('width', width) // le damos atributos (width)
      .attr('height', height) // height
    var myheight = parseInt(d3.select("#scatter").style("width"))

    // Nombres de los meses
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    for (var i = 0; i < 6; i++) {
      text1.push(svg.append('text')
        .attr('class', 'text')
        .attr('x', width / 11 + i * width * 0.134)
        .attr('y', y)
        .attr('id', i)
        .text(meses[i])
        .style('fill', 'white'))

    }

    var meses_2 = ['Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    for (var i = 0; i < 6; i++) {
      text2.push(svg.append('text')
        .attr('class', 'text')
        .attr('x', width / 11 + i * 90)
        .attr('y', y + 215)
        .text(meses_2[i])
        .style('fill', 'white'))
    }
    // Se dibujan los circulos del scaterplot
    svg.selectAll('circle')
      .data(datos)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return eX(d[varX])
      })
      .attr('cy', function(d) {
        return eY(d[varY])
      })
      .attr('r', function(d) {
        return 1 + +d[varZ] / 8000
      })
      .style('fill', function(d) {
        return c(+d[varZ])
      })
      .style('opacity', .8)
      .on('click', function(d, i) {
        var array;
        if (turn_fecha == '2018') {
          label_temperatura.text(Math.round(d.Temp_2018 * 100) / 100 + ' °C')
          label_precipitaciones.text(Math.round(d.Prec_2018 * 100) / 100 + ' l/m2')
          array = data_plot.filter(obj => {
            return formatDate_selection(obj.fecha) === d.Fecha_2018
          })
        } else if (turn_fecha == '2019') {
          label_temperatura.text(Math.round(d.Temp_2019 * 100) / 100 + ' °C')
          label_precipitaciones.text(Math.round(d.Prec_2019 * 100) / 100 + ' l/m2')
          array = data_plot.filter(obj => {
            return formatDate_selection(obj.fecha) === d.Fecha_2019
          })
        } else if (turn_fecha == '2020') {
          label_temperatura.text(Math.round(d.Temp * 100) / 100 + ' °C')
          label_precipitaciones.text(Math.round(d.Prec * 100) / 100 + ' l/m2')
          array = data_plot.filter(obj => {
            return formatDate_selection(obj.fecha) === d.Fecha
          })
        }
        last_day = array[0].fecha.getDay();
        last_month = array[0].fecha.getMonth() + 1;
        updatecircle(array[0]);
        updateplot(array);
      })

    var humidity = svg.append('text')
      .attr('x', -300)
      .attr('y', 400)
      .text('Precipitaciones:')
      .style('fill', 'white')
      .attr('transform', 'translate(' + (width - margin.left) + ',' + margin.top + ')')

    var temp = svg.append('text')
      .attr('x', -500)
      .attr('y', 400)
      .text('Temperatura:')
      .style('fill', 'white')
      .attr('transform', 'translate(' + (width - margin.left) + ',' + margin.top + ')')

    label_temperatura = svg.append('text')
      .attr('x', -400)
      .attr('y', 400)
      .text(Math.round(datos[0].Temp_2018 * 100) / 100 + ' °C')
      .style('fill', 'white')
      .attr('transform', 'translate(' + (width - margin.left) + ',' + margin.top + ')')

    label_precipitaciones = svg.append('text')
      .attr('x', -180)
      .attr('y', 400)
      .text(Math.round(datos[0].Prec_2018 * 100) / 100 + ' l/m2')
      .style('fill', 'white')
      .attr('transform', 'translate(' + (width - margin.left) + ',' + margin.top + ')')


    // Escala de color de la leyenda
    colorbar = svg.append('g')
      .attr('class', 'colorbar')
      .attr('transform', 'translate(' + (width - margin.left) + ',' + margin.top + ')')

    // Se añaden los colroes de la escala
    colorbar.selectAll('rect')
      .data(rango)
      .enter()
      .append('rect')
      .attr('x', function(d, i) {
        return 30
      })
      .attr('y', function(d, i) {
        return i * 10
      })
      .attr('width', function(d, i) {
        return 20
      })
      .attr('height', function(d, i) {
        return 20
      })
      .style('fill', function(d, i) {
        return d
      })
      .style('opacity', .8)

    // Se añaden los valores numéricos
    colorbar.selectAll('text')
      .data(dominio)
      .enter()
      .append('text')
      .attr("text-anchor", "end")
      .attr('class', 'label')
      .attr('x', function(d, i) {
        return 20
      })
      .attr('y', function(d, i) {
        return i * 10 + 8
      })
      .text(function(d) {
        return d.toFixed(1)
      })

    // Creamos un grupo para la leyenda de la escala de color
    // Se añaden las estiquetas
    colorbar.append('text')
      .attr('class', 'label')
      .attr("text-anchor", "end")
      .attr('x', 60)
      .attr('y', -10)
      .text('MW Consumidos')
      .style('fill', 'white')

    // Menú dropdown para la seleccion del año
    variables = Object.keys(d[0])
    comboX = d3.select('#selectButton')
      .on('change', function(d) {
        var turn
        varX = variables[comboX.property('selectedIndex')]
        updateyear(year[comboX.property('selectedIndex')])
      })
    comboXopt = comboX
      .selectAll('option').data(['Año 2018', 'Año 2019', 'Año 2020'])
      .enter()
      .append('option')
      .text(function(d) {
        return d
      })
  })
})



// Funcion ejecutada tras hacer click en alguno de los circulos del scatter PLOT
// Adapta los datos del dia seleccionado al formato requerido para el donut
function updatecircle(data) {
  keys = Object.keys(data)
  values = Object.values(data)
  keys.splice(0, 4)
  values.splice(0, 4)
  keys.splice(-2)
  values.splice(-2)
  keys = ["Eólica", "Nuclear", "Fuel/gas",
    "Carbón", "Ciclo combinado", "Hidráulica",
    "Intercambios int", "Enlace balear", "Solar fotovoltaica",
    "Solar térmica", "Térmica renovable", "Cogeneración y residuos"
  ]
  for (var i = 0; i < keys.length; i++) {
    data_donut[i] = {
      Tipo: keys[i],
      Cantidad: values[i]
    };
  }
  donut.data(data_donut)
};

function getDate() {
  var month, day;
  if (last_month < 10) month = '0' + String(last_month)
  else month = String(last_month)
  if (last_day < 10) day = '0' + String(last_day)
  else day = String(last_day)
  return (month + '-' + day)
}
// Funcion para actualizar los puntos del scatterplot al cambiar de año
function updateyear(turn) {
  var column_x;
  var column_y;
  var column_z;
  var tmp;
  switch (turn) {
    case 'Año 2018':
      tmp = data_plot.filter(obj => {
        return formatDate_selection(obj.fecha) === "2018-" + getDate()
      })
      updatecircle(tmp[0]);
      updateplot(tmp)
      turn_fecha = '2018';
      column_x = 'x_2018';
      column_y = 'y_2018';
      column_z = 'Real_2018';
      data = datos;
      break;

    case 'Año 2019':
      tmp = data_plot.filter(obj => {
        return formatDate_selection(obj.fecha) === "2019-" + getDate()
      })
      updatecircle(tmp[0]);
      updateplot(tmp)
      turn_fecha = '2019'
      column_x = 'x_2019';
      column_y = 'y_2019';
      column_z = 'Real_2019';
      data = datos;
      break;

    case 'Año 2020':
      tmp = data_plot.filter(obj => {
        return formatDate_selection(obj.fecha) === "2020-" + getDate()
      })
      updatecircle(tmp[0]);
      updateplot(tmp)
      turn_fecha = '2020'
      column_x = 'x';
      column_y = 'y';
      column_z = 'Real';
      data = datos_2020
      break;
  }

  varX = column_x;
  varY = column_y;
  varZ = column_z;

  // Reescalado de los ejes
  extentX = d3.extent(data, function(d) {
    return +d[column_x]
  })
  extentY = d3.extent(data, function(d) {
    return +d[column_y]
  })

  eX = d3.scaleLinear().domain(extentX).range([margin.left, width - margin.right - 100])
  eY = d3.scaleLinear().domain(extentY).range([margin.top, height - margin.bottom])
  xAxis_scatter = d3.axisBottom(eX);
  yAxis_scatter = d3.axisLeft(eY);

  svg.selectAll('circle')
    .data(data)
    .transition()
    .duration(1000)
    .attr('cx', function(d) {
      return eX(d[column_x])
    })
    .attr('cy', function(d) {
      return eY(d[column_y])
    })
    .attr('r', function(d) {
      return 1 + +d[column_z] / 8000
    }) // tamaño
    .style('fill', function(d) {
      return c(+d[column_z])
    }) // color según la escala
    .style('opacity', .8)

  svg.select(".x.axis")
    .transition()
    .duration(1000)
    .call(xAxis_scatter);

  // Update Y Axis
  svg.select(".y.axis")
    .transition()
    .duration(100)
    .call(yAxis_scatter);


  if (turn == 'Año 2020') {
    text1[5].style('fill', 'black')
    for (var i = 0; i < 6; i++) {
      text2[i].style('fill', 'black')
        .transition()
        .duration(1000)
    }

    for (var i = 0; i < 6; i++) {
      var x = text1[i].attr(x)
      text1[i].transition().duration(2000).attr('x', x + 100 + 100 * i);
    }
  } else if (turn == 'Año 2019' || turn == 'Año 2018') {
    for (var i = 0; i < 6; i++) {
      var x = text1[i].attr(x)
      text1[i].transition().duration(2000).attr('x', width / 11 + i * width * 0.134);
    }
    for (var i = 0; i < 6; i++) {
      text2[i].style('fill', 'white')
        .transition()
        .duration(1000)
    }
    text1[5].style('fill', 'white')
  }
}