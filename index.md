<!DOCTYPE html>
<html>
<head>
    <title>Interactive Visualizations</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="myDiv" style="width: 100%; height: 100%;"></div>
    <script>
        function fetchData() {
            // Simulating data fetching from WebR using evalJson
            return new Promise((resolve) => {
                // Replace this with actual fetch from WebR
                const data = [{
                    x: [1, 2, 3],
                    y: [2, 3, 5],
                    type: 'scatter'
                }];
                resolve(data);
            });
        }
        fetchData().then(data => {
            Plotly.newPlot('myDiv', data);
        });
    </script>
</body>
</html>