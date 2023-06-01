# Chart Visualization with Chart.js

This project is a web-based data visualization application that utilizes the Chart.js library to create various types of charts, including line charts, scatter plots, box plots, and histograms. It allows users to upload a CSV file or load data from a URL, visualize the data in different chart types, and customize the chart settings.

## How it Works

1. **Data Input:** Users can either upload a CSV file or provide a URL to load the data using the ?dataSource=<url> query paramenter. The CSV data is parsed into JSON objects and stored in the browser's localStorage.

2. **Chart Selection:** Users can choose from four chart types: Line chart, Scatter plot, Box plot, and Histogram. Each chart type represents the data in a different visual format.

3. **Chart Customization:** Users can select the x-axis and y-axis fields from the loaded data to plot on the Line chart and Scatter plot. They can also specify additional parameters, such as the number of bins for the Histogram chart.

4. **Chart Rendering:** When a chart type is selected and customized, the application generates the corresponding chart using the Chart.js library. The chart is displayed in the provided container.

5. **Chart Switching:** Users can switch between different chart types without refreshing the page. The existing chart is destroyed, and a new chart is created based on the selected chart type and customization.

## Creator

This Chart Visualization application was created by David Tarrant and ChatGPT. In terms of lines of code, ChatGPT generated about 90% of them! It is a demonstration of using the Chart.js library to create interactive and dynamic charts for data visualization purposes.

## Requirements

- Web browser with JavaScript enabled.
- Internet connection (if loading data from a URL).

## How to Use

1. Clone this repository to your local machine.

2. Open the `index.html` file in a web browser.

3. Use the provided interface to upload a CSV file or enter a URL to load data using the ?dataSource=<url> query parameter.

4. Select the desired chart type and customize the chart settings as needed.

5. To switch to a different chart type, select the new chart type using the buttons.

## Technologies Used

- HTML
- CSS
- JavaScript
- Chart.js (version 4.3.0)
- chartjs-chart-boxplot (version 3.10.0)

## Acknowledgments

This project was inspired by the capabilities of the Chart.js library and the need for a simple and customizable data visualization tool. Special thanks to the Chart.js community for providing an excellent charting solution. Additionally, the `chartjs-chart-boxplot` plugin was used for creating box plots.

For more information about Chart.js, please visit the [Chart.js documentation](https://www.chartjs.org/docs).

For more information about the `chartjs-chart-boxplot` plugin, please visit its [GitHub repository](https://github.com/sgratzl/chartjs-chart-boxplot).