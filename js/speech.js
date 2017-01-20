        var client;
        var request;

        function getMode() {
            return Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionMode.shortPhrase;
        }
        function getKey() {
            return "55219554022a4863ac15c1484d2f1284";
        }
        function getLanguage() {
            return "zh-HK";
        }
 		function msStart() {
            clearText();
            var mode = getMode();
            client = Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionServiceFactory.createMicrophoneClient(
                mode,
                getLanguage(),
                getKey());
            client.startMicAndRecognition();
            setTimeout(function () {
                client.endMicAndRecognition();
            }, 5000);
            client.onPartialResponseReceived = function (response) {
                setText(response);
            }
            client.onFinalResponseReceived = function (response) {
                setText(JSON.stringify(response));
            }
            client.onIntentReceived = function (response) {
                setText(response);
            };
        }

        function clearText() {
            document.getElementById("output").value = "";
        }
        function setText(text) {
            document.getElementById("output").value += text;
        }