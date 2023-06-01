    Chart.defaults.font.size = 16;
    var currentChartType = "line";
    var colorCounter = 0;
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
      var pointColorSelect = document.getElementById('pointColor')

      // Clear existing options
      while (xAxisSelect.firstChild) {
        xAxisSelect.removeChild(xAxisSelect.firstChild);
      }
      while (yAxisSelect.firstChild) {
        yAxisSelect.removeChild(yAxisSelect.firstChild);
      }
      while (pointColorSelect.firstChild) {
        pointColorSelect.removeChild(pointColorSelect.firstChild);
      }

      // Populate options with keys from JSON data
      Object.keys(jsonData[0]).forEach(function(key) {
        var xAxisOption = document.createElement('option');
        var yAxisOption = document.createElement('option');
        var pointColorOption = document.createElement('option');
        xAxisOption.value = key;
        yAxisOption.value = key;
        pointColorOption.value = key;
        xAxisOption.text = key;
        yAxisOption.text = key;
        pointColorOption.text = key;
        xAxisSelect.appendChild(xAxisOption);
        yAxisSelect.appendChild(yAxisOption);
        pointColorSelect.appendChild(pointColorOption);
      });

      // Show the axis selections
      document.getElementById('axisSelections').style.display = 'block';
    }

    var chartInstance; // Variable to store the chart instance

    function changeChartType(selectedChartType) {
      colorCounter = 0;
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
      if (selectedChartType == "scatter") {
        document.getElementById('pointColorSelector').style.display = "inline-block";
      } else {
        document.getElementById('pointColorSelector').style.display = "none";
      }
      
      var selectedXAxis = document.getElementById('xAxis').value;
      var selectedYAxis = document.getElementById('yAxis').value;
      var selectedColourValues = document.getElementById('pointColor').value;
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
        createScatterPlot(jsonData, selectedXAxis, selectedYAxis,selectedColourValues);
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

    function createScatterPlot(data, xAxis, yAxis, colorField) {
      var xValues = data.map(function(item) {
        return item[xAxis];
      });

      var yValues = data.map(function(item) {
        return item[yAxis];
      });

      var colorValues = data.map(function(item) {
        return item[colorField];
      });

      colorValues = removeUndefinedValues(colorValues);
      console.log(colorValues);
      var uniqueColorValues = [...new Set(colorValues)];

      console.log(uniqueColorValues);
      var scatterData = {
        datasets: uniqueColorValues.map(function(value) {
          var filteredData = data.filter(function(item) {
            return item[colorField] === value;
          });

          return {
            data: filteredData.map(function(item) {
              return {
                x: item[xAxis],
                y: item[yAxis],
              };
            }),
            backgroundColor: getColor(),
            label: value.toString(),
          };
        }),
      };

      var scatterOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: xAxis,
            },
          },
          y: {
            title: {
              display: true,
              text: yAxis,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
          },
        },
      };

      chartInstance = new Chart(document.getElementById('canvas'), {
        type: 'scatter',
        data: scatterData,
        options: scatterOptions,
      });
    }

    // Helper function to generate random colors
    function getColor() {
      var Tableau20 = ['#4E79A7', '#A0CBE8', '#F28E2B', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];
      var Paired12 = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];
      var color = Paired12[colorCounter]; 
      colorCounter += 1;
      return color; 
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
              text: yAxis,
            },
          },
          x: {
            title: {
              display: true,
              text: xAxis,
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
          labels: [""],
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
          if (value >= bins[j] && value <= bins[j + 1]) {
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