document.getElementById('csvFileInput').addEventListener('change', function(e) {
      var file = e.target.files[0];
      var reader = new FileReader();

      reader.onload = function(e) {
        var contents = e.target.result;
        var jsonData = CSVtoJSON(contents);
        localStorage.setItem('jsonData', JSON.stringify(jsonData));
        populateAxisSelections(); // Call the axis selection population function after parsing the CSV
        changeChartType(); // Call the chart type change function after parsing the CSV
      };

      reader.readAsText(file);
    });

    function CSVtoJSON(csv) {
      var lines = csv.split('\n');
      var result = [];
      var headers = lines[0].split(',');

      for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(',');

        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }

        result.push(obj);
      }

      return result;
    }

    function populateAxisSelections() {
      var jsonData = JSON.parse(localStorage.getItem('jsonData'));
      var xAxisSelect = document.getElementById('xAxis');
      var yAxisSelect = document.getElementById('yAxis');

      // Clear existing options
      while (xAxisSelect.firstChild) {
        xAxisSelect.removeChild(xAxisSelect.firstChild);
      }
      while (yAxisSelect.firstChild) {
        yAxisSelect.removeChild(yAxisSelect.firstChild);
      }

      // Populate options with keys from JSON data
      Object.keys(jsonData[0]).forEach(function(key) {
        var xAxisOption = document.createElement('option');
        var yAxisOption = document.createElement('option');
        xAxisOption.value = key;
        yAxisOption.value = key;
        xAxisOption.text = key;
        yAxisOption.text = key;
        xAxisSelect.appendChild(xAxisOption);
        yAxisSelect.appendChild(yAxisOption);
      });

      // Show the axis selections
      document.getElementById('axisSelections').style.display = 'block';
    }

    var chartInstance; // Variable to store the chart instance

    function changeChartType() {
      var selectedChartType = document.getElementById('chartType').value;
      var selectedXAxis = document.getElementById('xAxis').value;
      var selectedYAxis = document.getElementById('yAxis').value;
      var binCount = parseInt(document.getElementById('binCount').value);
      var jsonData = JSON.parse(localStorage.getItem('jsonData'));

      // Clear the existing chart
      if (chartInstance) {
        chartInstance.destroy();
      }
      // Create the desired chart based on the selected chart type
      if (selectedChartType === 'line') {
        createLineChart(jsonData, selectedXAxis, selectedYAxis);
      } else if (selectedChartType === 'scatter') {
        createScatterPlot(jsonData, selectedXAxis, selectedYAxis);
      } else if (selectedChartType === 'boxplot') {
        createBoxPlot(jsonData);
      } else if (selectedChartType === 'histogram') {
        createHistogram(jsonData, selectedXAxis, binCount);
      }
    }

    function createLineChart(data, xAxis, yAxis) {
      var chartData = data.map(function(item) {
        return {
          x: item[xAxis],
          y: item[yAxis]
        };
      });

      chartInstance = new Chart(document.getElementById('canvas'), {
        type: 'line',
        data: {
          datasets: [{
            label: yAxis,
            data: chartData,
            borderColor: 'rgb(75, 192, 192)',
            fill: false
          }]
        },
        options: {
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: xAxis
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: yAxis
              }
            }
          }
        }
      });
    }

    function createScatterPlot(data, xAxis, yAxis) {
      var chartData = data.map(function(item) {
        return {
          x: item[xAxis],
          y: item[yAxis]
        };
      });

      chartInstance = new Chart(document.getElementById('canvas'), {
        type: 'scatter',
        data: {
          datasets: [{
            label: yAxis,
            data: chartData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
          }]
        },
        options: {
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: xAxis
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: yAxis
              }
            }
          }
        }
      });
    }

    function createBoxPlot(data) {
      // Implement your code to create a box plot using the @sgratzl/chartjs-chart-boxplot library
      // You can access the data variable, which contains the parsed CSV data
    }

    function createHistogram(data, xAxis, binCount) {
      var values = data.map(function(item) {
        var value = item[xAxis];
        return isNaN(value) ? null : value;
      }).filter(function(value) {
        return value !== null;
      });
      console.log(values);
      // Calculate logical boundaries for the bins
      var minValue = Math.min(...values);
      var maxValue = Math.max(...values);
      var binWidth = (maxValue - minValue) / binCount;
      var bins = [];
      for (var i = 0; i <= binCount; i++) {
        bins.push(minValue + i * binWidth);
      }

      var counts = Array(binCount).fill(0);
      for (var i = 0; i < values.length; i++) {
        var value = parseFloat(values[i]);
        for (var j = 0; j < binCount; j++) {
          if (value >= bins[j] && value < bins[j + 1]) {
            counts[j]++;
            break;
          }
        }
      }

      chartInstance = new Chart(document.getElementById('canvas'), {
        type: 'bar',
        data: {
          labels: bins.slice(0, -1).map(function(bin, index) {
            return bin.toFixed(2) + '-' + bins[index + 1].toFixed(2);
          }),
          datasets: [{
            label: 'Histogram',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
          }]
        },
        options: {
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Bins'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Frequency'
              }
            }
          }
        }
      });
    }