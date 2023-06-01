    Chart.defaults.font.size = 16;
    var currentChartType = "line";
    var colorCounter = 0;
    var defaultXAxis;
    var defaultYAxis;
    var defaultColorSelector;
    document.addEventListener('DOMContentLoaded', function() {
      var urlParams = new URLSearchParams(window.location.search);
      var dataSource = urlParams.get('dataSource');
      if (dataSource) {
        currentChartType = urlParams.get('chartType') || 'line';
        defaultXAxis = urlParams.get('xAxis') || '';
        defaultYAxis = urlParams.get('yAxis') || '';
        defaultColorSelector = urlParams.get('colorSelector') || '';
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
      var pointColorOption = document.createElement('option');
      pointColorOption.value = "none";
      pointColorOption.text = "none";
      pointColorSelect.appendChild(pointColorOption);
      Object.keys(jsonData[0]).forEach(function(key) {
        var xAxisOption = document.createElement('option');
        var yAxisOption = document.createElement('option');
        var pointColorOption = document.createElement('option');
        xAxisOption.value = key;
        if (key === defaultXAxis) {
          xAxisOption.selected = true;
        }
        yAxisOption.value = key;
        if (key === defaultYAxis) {
          yAxisOption.selected = true;
        }
        pointColorOption.value = key;
        if (key.trim() === defaultColorSelector) {
          pointColorOption.selected = true;
        }
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
        document.getElementById('pointColorSelector').style.display = "inline-block";
        document.getElementById('yAxisSelector').style.display = "none";  
      } else {
        document.getElementById('binCountSelector').style.display = "none";
        document.getElementById('pointColorSelector').style.display = "none";
        document.getElementById('yAxisSelector').style.display = "inline-block";  
      }
      if (selectedChartType == "scatter") {
        document.getElementById('pointColorSelector').style.display = "inline-block";
      }
      if (selectedChartType != "histogram" && selectedChartType != "scatter") {
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
      console.log(selectedChartType);
      // Create the desired chart based on the selected chart type
      if (selectedChartType === 'line') {
        createLineChart(jsonData, selectedXAxis, selectedYAxis);
      } else if (selectedChartType === 'scatter') {
        createScatterPlot(jsonData, selectedXAxis, selectedYAxis, selectedColourValues);
      } else if (selectedChartType === 'boxplot') {
        createBoxPlot(jsonData, selectedXAxis, selectedYAxis);
      } else if (selectedChartType === 'histogram' && selectedColourValues != "none") {
        createHistogram(jsonData, selectedXAxis, binCount, selectedColourValues);
      } else if (selectedChartType === 'histogram') {
        createHistogramAllData(jsonData, selectedXAxis, binCount);
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
      var uniqueColorValues = [...new Set(colorValues)];

      if (colorField == "none") {
        var scatterData = {
          datasets: [{
            label: xAxis + ", " + yAxis,
            data: data.map(function(item) {
              return {
                x: item[xAxis],
                y: item[yAxis]
              };
            })
          }]
        };
      } else {
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
      }

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

    function createHistogram(data, xAxis, binCount, splitField) {
      var xValues = data.map(function(item) {
        return item[xAxis];
      });

      var splitValues = data.map(function(item) {
        return item[splitField];
      });

      var uniqueSplitValues = [...new Set(splitValues)];

      uniqueSplitValues = removeUndefinedValues(uniqueSplitValues);
      xValues = removeUndefinedValues(xValues);
      var min = Math.min(...xValues);
      var max = Math.max(...xValues);
      
      var datasets = uniqueSplitValues.map(function(value) {
        var filteredData = data.filter(function(item) {
          return item[splitField] === value;
        });

        var histogramData = createHistogramData(filteredData.map(function(item) {
          return item[xAxis];
        }), binCount, min, max);

        return {
          label: value.toString(),
          data: histogramData,
          backgroundColor: getColor(),
          borderColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: 1,
        };
      });
      /*
        var datasets = uniqueSplitValues.map(function(value) {
        var filteredData = data.filter(function(item) {
          return item[splitField] === value;
        });

        var histogramData = createHistogramData(filteredData.map(function(item) {
          return item[xAxis];
        }), binCount);
        console.log(histogramData);
        return {
          label: value.toString(),
          data: histogramData,
          backgroundColor: getColor(),
          borderColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: 1,
        };
      });
      */
      
      var histogramOptions = {
        responsive: true,
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
              text: 'Frequency',
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
        type: 'bar',
        data: {
          labels: createHistogramLabels(binCount, min, max),
          datasets: datasets,
        },
        options: histogramOptions,
      });

    }

    // Helper function to create histogram data
    function createHistogramData(data, binCount,min,max) {
      var binSize = (max - min) / binCount;

      var histogramData = Array.from({ length: binCount }, function() {
        return 0;
      });

      data.forEach(function(value) {
        var binIndex = Math.floor((value - min) / binSize);
        if (binIndex == binCount) {
          binIndex = binIndex - 1;
        }
        if (binIndex >= 0 && binIndex < binCount) {
          histogramData[binIndex]++;
        }
      });

      return histogramData;
    }

    // Helper function to create histogram labels
    function createHistogramLabels(binCount, min, max) {
      var binSize = (max - min) / binCount;
      var labels = [];

      for (var i = 0; i < binCount; i++) {
        var label = `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`;
        labels.push(label);
      }

      return labels;
    }
    
    function createHistogramAllData(data, xAxis, binCount) {
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
    