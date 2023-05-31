    Chart.defaults.font.size = 16;
    var currentChartType = "line";
    document.addEventListener('DOMContentLoaded', function() {
      var urlParams = new URLSearchParams(window.location.search);
      var dataSource = urlParams.get('dataSource');
      if (dataSource) {
        // Fetch the CSV data from the specified URL
        fetch(dataSource)
          .then(response => response.text())
          .then(csvData => {
            // Parse the CSV data into a JSON object
            var jsonData = CSVtoJSON(csvData);
            // Store the parsed JSON data in local storage
            localStorage.setItem('jsonData', JSON.stringify(jsonData));
            populateAxisSelections(); // Call the axis selection population function after parsing the CSV
            changeChartType(); // Call the chart type change function after parsing the CSV
          });
        }
      });
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

    function changeChartType(selectedChartType) {
      if (!selectedChartType) {
        selectedChartType = currentChartType;
      }
      currentChartType = selectedChartType;
      if (selectedChartType == "histogram") {
        document.getElementById('binCountSelector').style.display = "inline-block";
        document.getElementById('yAxisSelector').style.display = "none";  
      } else {
        document.getElementById('binCountSelector').style.display = "none";
        document.getElementById('yAxisSelector').style.display = "inline-block";  
      }
      
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
        createBoxPlot(jsonData, selectedXAxis, selectedYAxis);
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
            data: chartData
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
          },
          plugins: {
            colorschemes: {
              scheme: 'brewer.Paired12'
            },
            legend: {
                display: false,
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
            label: xAxis + ", " + yAxis,
            data: chartData
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
          },
          plugins: {
            colorschemes: {
              scheme: 'brewer.Paired12'
            },
            legend: {
              display: false,
            }
          }
        }
      });
    }

    function removeUndefinedValues(array) {
     return array.filter(value => typeof value !== 'undefined');
    }

    function createBoxPlot(data, xAxis, yAxis) {
      // Get the unique values for the yAxis
      var uniqueXAxisValues = removeUndefinedValues(Array.from(new Set(data.map(item => item[xAxis]))));

      // Prepare the datasets for the box plot
      var datasets = uniqueXAxisValues.map((xValue, index) => {
        var filteredData = data.filter(item => item[xAxis] === xValue);
        var values = filteredData.map(item => parseFloat(item[yAxis]));

        return {
          label: xValue,
          data: [values],
        };
      });

      var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: xAxis,
            },
          },
          x: {
            title: {
              display: false,
              text: yAxis,
            },
          },
        },
        plugins: {
          colorschemes: {
            scheme: 'brewer.Paired12'
          },
        },
      };

      // Create the box plot chart
      chartInstance = new Chart(document.getElementById('canvas'), {
        type: 'boxplot',
        data: {
          labels: [yAxis],
          datasets: datasets,
        },
        options: chartOptions,
      });

      document.getElementById('canvas').style.height = '460px';
    }

    function createHistogram(data, xAxis, binCount) {
      var values = data.map(function(item) {
        var value = item[xAxis];
        return isNaN(value) ? null : value;
      }).filter(function(value) {
        return value !== null;
      });
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
            label: 'Frequency',
            data: counts
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
          },
          plugins: {
            colorschemes: {
              scheme: 'brewer.Paired12'
            },
            legend: {
              display: false,
            }
          }
        }
      });
    }