var globalChart;
var globalFilters = ["0", "0", "0", []];
var globalSortingFunction = [false, function (a, b) { return parseInt(a.Cle_Test) - parseInt(b.Cle_Test) }];

function findCommonElement(arr1, arr2) {

    let obj = {};
    for (let i = 0; i < arr1.length; i++) {
        if (!obj[arr1[i]]) {
            const element = arr1[i];
            obj[element] = true;
        }
    }
    for (let j = 0; j < arr2.length; j++) {
        if (obj[arr2[j]]) {
            return true;
        }
    }
    return false;
}

function badgeColorSwitch(status) {
    var badgeColor = "badge bg-";
    switch (status) {
        case "PASSED":
            badgeColor = badgeColor.concat("success");
            break;
        case "OK":
            badgeColor = badgeColor.concat("success");
            break;
        case "FAILED":
            badgeColor = badgeColor.concat("danger");
            break;
        case "NOK":
            badgeColor = badgeColor.concat("danger");
            break;
        case "NOTRUN":
            badgeColor = badgeColor.concat("warning text-dark");
            break;
        case "EXECUTING":
            badgeColor = badgeColor.concat("warning text-dark");
            break;
        case "UNCOVERED":
            badgeColor = badgeColor.concat("primary");
            break;
        default:
            break;
    }
    return badgeColor;
}

function addFilters(testJSON) {
    const testJSONLen = testJSON.length;

    var currentLastDiv = document.getElementById("inputGroup-Filters-SelectPriorite-end");
    var parentDiv = document.getElementById("inputGroup-Filters-SelectPriorite");
    parentDiv.replaceChildren(currentLastDiv);
    var newOption = document.createElement("option");
    newOption.setAttribute("value", "0");
    newOption.appendChild(document.createTextNode("Tous..."));
    parentDiv.insertBefore(newOption, currentLastDiv);

    currentLastDiv = document.getElementById("inputGroup-Filters-SelectTestType-end");
    parentDiv = document.getElementById("inputGroup-Filters-SelectTestType");
    parentDiv.replaceChildren(currentLastDiv);
    newOption = document.createElement("option");
    newOption.setAttribute("value", "0");
    newOption.appendChild(document.createTextNode("Tous..."));
    parentDiv.insertBefore(newOption, currentLastDiv);


    const filterPriority = [];
    const filterTestType = [];
    const filterTags = [];
    var newfilterTag;

    for (let i = 0; i < testJSONLen; i++) {
        if (!filterPriority.includes(testJSON[i].Priorite)) {
            filterPriority.push(testJSON[i].Priorite);
        }
        if (!filterTestType.includes(testJSON[i].Type)) {
            filterTestType.push(testJSON[i].Type);
        }
        newfilterTag = testJSON[i].Etiquettes.split("tag:\"");
        for (let j = 1; j < newfilterTag.length; j++) {
            newfilterTag[j] = newfilterTag[j].split('\"')[0];
            if (!filterTags.includes(newfilterTag[j])) {
                filterTags.push(newfilterTag[j]);
            }
        }
    }

    filterPriority.sort();
    filterTestType.sort();
    filterTags.sort();

    currentLastDiv = document.getElementById("inputGroup-Filters-SelectPriorite-end");
    parentDiv = document.getElementById("inputGroup-Filters-SelectPriorite");

    var dataLength = filterPriority.length;
    for (let i = 0; i < dataLength; i++) {
        newOption = document.createElement("option");
        newOption.setAttribute("value", filterPriority[i]);
        newOption.appendChild(document.createTextNode(filterPriority[i]));
        parentDiv.insertBefore(newOption, currentLastDiv);
    }

    currentLastDiv = document.getElementById("inputGroup-Filters-SelectTestType-end");
    parentDiv = document.getElementById("inputGroup-Filters-SelectTestType");
    dataLength = filterTestType.length;
    for (let i = 0; i < dataLength; i++) {
        newOption = document.createElement("option");
        newOption.setAttribute("value", filterTestType[i]);
        newOption.appendChild(document.createTextNode(filterTestType[i]));
        parentDiv.insertBefore(newOption, currentLastDiv);
    }

    currentLastDiv = document.getElementById("inputGroup-Filters-SelectEtiquette-end");
    parentDiv = document.getElementById("inputGroup-Filters-SelectEtiquette");
    dataLength = filterTags.length;
    var newListElement, newLinkElement, newDivElement, newInputElement, newLabelElement;

    for (let i = 0; i < dataLength; i++) {
        newInputElement = document.createElement("input");
        newInputElement.setAttribute("class", "form-check-input");
        newInputElement.setAttribute("type", "checkbox");
        newInputElement.setAttribute("value", "");
        newInputElement.setAttribute("id", "tags-checkbox-".concat(i));
        newLabelElement = document.createElement("label");
        newLabelElement.setAttribute("class", "form-check-label");
        newLabelElement.setAttribute("for", "tags-checkbox-".concat(i));
        newLabelElement.appendChild(document.createTextNode(filterTags[i]));
        newDivElement = document.createElement("div");
        newDivElement.setAttribute("class", "form-check");
        newDivElement.appendChild(newInputElement);
        newDivElement.appendChild(newLabelElement);
        newLinkElement = document.createElement("a");
        newLinkElement.setAttribute("class", "dropdown-item");
        newLinkElement.setAttribute("href", "#");
        newLinkElement.appendChild(newDivElement);
        newListElement = document.createElement("li");
        newListElement.appendChild(newLinkElement);
        parentDiv.insertBefore(newListElement, currentLastDiv);
    }
}

function addElementCoverageReport(testJSON, filters) {
    var id, description, status, tags;
    var badgeColor;
    const testJSONLen = testJSON.length;

    var currentLastDiv = document.getElementById("coverage-report-link-end");
    var parentDiv = document.getElementById("coverage-report-link");
    parentDiv.replaceChildren(currentLastDiv);
    currentLastDiv = document.getElementById("coverage-report-text-end");
    parentDiv = document.getElementById("coverage-report-text");
    parentDiv.replaceChildren(currentLastDiv);

    // Create chart instance
    if (globalChart) {
        globalChart.dispose();
    }
    globalChart = am4core.create("chartdiv", am4charts.PieChart);

    // Create pie series
    var series = globalChart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "Number";
    series.dataFields.category = "Status";
    series.slices.template.propertyFields.fill = "color";
    globalChart.innerRadius = am4core.percent(40);

    // Add data
    const dataSum = [
        {
            "Status": "PASSED",
            "Number": 0,
            "color": am4core.color("#25BD20")
        },
        {
            "Status": "FAILED",
            "Number": 0,
            "color": am4core.color("#BD2020")
        },
        {
            "Status": "NOTRUN",
            "Number": 0,
            "color": am4core.color("#eda832")
        },
        {
            "Status": "UNCOVERED",
            "Number": 0,
            "color": am4core.color("#214dbf")
        }
    ];

    for (let i = 0; i < testJSONLen; i++) {
        id = testJSON[i].Cle_Test;
        description = testJSON[i].Description;
        status = testJSON[i].Status;
        tags = testJSON[i].Etiquettes.split("tag:\"");
        for (let j = 1; j < tags.length; j++) {
            tags[j] = tags[j].split('\"')[0];
        }

        if ((filters[0] == "0" || filters[0] == status) && (filters[1] == "0" || filters[1] == testJSON[i].Priorite) && (filters[2] == "0" || filters[2] == testJSON[i].Type) && (filters[3].length == 0 || findCommonElement(filters[3], tags))) {

            for (let x = 0; x < 4; x++) {
                if (dataSum[x].Status == status) {
                    dataSum[x].Number++;
                }
            }

            badgeColor = badgeColorSwitch(status);

            const newTestLink = document.createElement("a");
            const newTestName = document.createElement("h4");
            const newTestDesc = document.createElement("p");
            const newTestLinkStatus = document.createElement("span");
            const newTestNameStatus = document.createElement("span");

            const newTestLinkContent = document.createTextNode("Test ".concat(id).concat(" "));
            const newTestNameContent = document.createTextNode("Test ".concat(id).concat(" "));
            const newTestDescContent = document.createTextNode(description);
            const newTestLinkStatusContent = document.createTextNode(status);
            const newTestNameStatusContent = document.createTextNode(status);

            newTestLinkStatus.appendChild(newTestLinkStatusContent);
            newTestLinkStatus.setAttribute("class", badgeColor);

            newTestNameStatus.appendChild(newTestNameStatusContent);
            newTestNameStatus.setAttribute("class", badgeColor);

            newTestLink.appendChild(newTestLinkContent);
            newTestLink.appendChild(newTestLinkStatus);
            newTestLink.setAttribute("class", "list-group-item list-group-item-action");
            newTestLink.setAttribute("href", "#list-item-".concat(id));
            newTestLink.setAttribute("style", "font-size: 40px;");

            newTestName.appendChild(newTestNameContent);
            newTestName.appendChild(newTestNameStatus);
            newTestName.setAttribute("id", "list-item-".concat(id));

            newTestDesc.appendChild(newTestDescContent);

            var currentLastDiv = document.getElementById("coverage-report-link-end");
            var parentDiv = document.getElementById("coverage-report-link");
            parentDiv.insertBefore(newTestLink, currentLastDiv);
            currentLastDiv = document.getElementById("coverage-report-text-end");
            parentDiv = document.getElementById("coverage-report-text");
            parentDiv.insertBefore(newTestName, currentLastDiv);
            parentDiv.insertBefore(newTestDesc, currentLastDiv);
        }
    }
    for (let x = 0; x < 4; x++) {
        if (dataSum[x].Number == 0) {
            delete dataSum[x];
        }
    }
    globalChart.data = dataSum;
}

function addElementTestListReport(testJSON, execJSON, filters) {
    var badgeColor, testTags, testTagsLen;
    const testJSONLen = testJSON.length;
    const execJSONLen = execJSON.length;

    var currentLastDiv = document.getElementById("test-list-report-end");
    var parentDiv = document.getElementById("test-list-report");
    parentDiv.replaceChildren(currentLastDiv);

    for (let t = 0; t < testJSONLen; t++) {
        testTags = testJSON[t].Etiquettes.split("tag:\"");
        testTagsLen = testTags.length;
        for (let j = 1; j < testTagsLen; j++) {
            testTags[j] = testTags[j].split('\"')[0];
        }
        testTags.sort();

        if ((filters[0] == "0" || filters[0] == testJSON[t].Status) && (filters[1] == "0" || filters[1] == testJSON[t].Priorite) && (filters[2] == "0" || filters[2] == testJSON[t].Type) && (filters[3].length == 0 || findCommonElement(filters[3], testTags))) {

            badgeColor = badgeColorSwitch(testJSON[t].Status);

            const newContainerTestElement = document.createElement("div");
            newContainerTestElement.setAttribute("class", "container-fluid p-3 border bg-light");
            newContainerTestElement.setAttribute("style", "font-size: 30px;");

            const dataTest = [testJSON[t].Status, "Test ".concat(testJSON[t].Cle_Test).concat(" : "), testJSON[t].Type, "Priorité: ".concat(testJSON[t].Priorite), "Version de correction: ".concat(testJSON[t].Version_correction), "Progression: ".concat(testJSON[t].Progression), "Total (executions de test): ".concat(testJSON[t].Totaux_exec_test), "Taux de succès: ".concat(testJSON[t].Taux_succes), "Description: ".concat(testJSON[t].Description), "Etiquettes: "];
            const columnsTest = [0, 1, 4, 7, 9];
            const columnsTestLen = columnsTest.length;
            var RowTestElement;
            var ColTestElement;
            for (let i = 1; i < columnsTestLen; i++) {
                RowTestElement = document.createElement("div");
                RowTestElement.setAttribute("class", "row");
                for (let j = 0; j < columnsTest[i] - columnsTest[i - 1]; j++) {
                    ColTestElement = document.createElement("div");
                    ColTestElement.setAttribute("class", "col");
                    ColTestElement.appendChild(document.createTextNode(dataTest[columnsTest[i - 1] + j + 1]));
                    if (i + j == 1) {
                        var nameColTestElementStatus = document.createElement("span");
                        nameColTestElementStatus.setAttribute("class", badgeColor);
                        nameColTestElementStatus.appendChild(document.createTextNode(dataTest[0]));
                        ColTestElement.appendChild(nameColTestElementStatus);
                    }
                    if (i == columnsTestLen - 1 && j == columnsTest[i] - columnsTest[i - 1] - 1) {
                        for (let k = 0; k < testTagsLen; k++) {
                            var nameColTestElementTag = document.createElement("span");
                            nameColTestElementTag.setAttribute("class", "badge bg-info");
                            nameColTestElementTag.appendChild(document.createTextNode(testTags[k]));
                            ColTestElement.appendChild(nameColTestElementTag);
                        }
                    }
                    RowTestElement.appendChild(ColTestElement);
                }
                newContainerTestElement.appendChild(RowTestElement);
            }

            const newColExecElement = document.createElement("div");
            newColExecElement.setAttribute("class", "col");
            newColExecElement.setAttribute("style", "max-height:20vh; overflow-y: scroll;");
            var newContainerExecElement;
            var dataExec;
            var RowExecElement;
            var ColExecElement;

            for (let k = 0; k < execJSONLen; k++) {
                if (execJSON[k].Cle_Test == testJSON[t].Cle_Test) {
                    badgeColor = badgeColorSwitch(execJSON[k].Status);
                    newContainerExecElement = document.createElement("div");
                    newContainerExecElement.setAttribute("class", "container-fluid p-3 border bg-light");
                    newContainerExecElement.setAttribute("style", "font-size: 30px;");

                    dataExec = [execJSON[k].Status, "Execution ".concat(execJSON[k].Cle_Execution).concat(" : "), "Début: ".concat(execJSON[k].Date_de_debut), "Fin: ".concat(execJSON[k].Date_de_fin), "Durée: ".concat(execJSON[k].Temps_ecoule), "Executeur: ".concat(execJSON[k].Executeur), "Environnement: ".concat(execJSON[k].Environnement), "Composants personnalisés: "];
                    const columnsExec = [0, 1, 4, 6, 7];
                    const columnsExecLen = columnsExec.length;

                    for (let i = 1; i < columnsExecLen; i++) {
                        RowExecElement = document.createElement("div");
                        RowExecElement.setAttribute("class", "row");
                        for (let j = 0; j < columnsExec[i] - columnsExec[i - 1]; j++) {
                            ColExecElement = document.createElement("div");
                            ColExecElement.setAttribute("class", "col");
                            ColExecElement.appendChild(document.createTextNode(dataExec[columnsExec[i - 1] + j + 1]));
                            if (i + j == 1) {
                                var nameColExecElementStatus = document.createElement("span");
                                nameColExecElementStatus.setAttribute("class", badgeColor);
                                nameColExecElementStatus.appendChild(document.createTextNode(dataExec[0]));
                                ColExecElement.appendChild(nameColExecElementStatus);
                            }
                            RowExecElement.appendChild(ColExecElement);
                        }
                        newContainerExecElement.appendChild(RowExecElement);
                    }
                    newColExecElement.appendChild(newContainerExecElement);
                }
            }

            const newColTestElement = document.createElement("div");
            newColTestElement.setAttribute("class", "col");
            newColTestElement.appendChild(newContainerTestElement);


            const newRowElement = document.createElement("div");
            newRowElement.setAttribute("class", "row");
            newRowElement.appendChild(newColTestElement);
            newRowElement.appendChild(newColExecElement);


            const newListElement = document.createElement("li");
            newListElement.setAttribute("class", "list-group-item");
            newListElement.appendChild(newRowElement);

            var currentLastDiv = document.getElementById("test-list-report-end");
            var parentDiv = document.getElementById("test-list-report");
            parentDiv.insertBefore(newListElement, currentLastDiv);
        }
    }
}

function addElementTracabilityReport(testJSON, execJSON, exigJSON, defautJSON, filters) {
    const testJSONLen = testJSON.length;
    const execJSONLen = execJSON.length;
    const exigJSONLen = exigJSON.length;
    const defautJSONLen = defautJSON.length;
    var badgeColor, testTags;

    var currentLastDiv = document.getElementById("tracability-report-end");
    var parentDiv = document.getElementById("tracability-report");
    parentDiv.replaceChildren(currentLastDiv);

    for (let exigNo = 0; exigNo < exigJSONLen; exigNo++) {
        badgeColor = badgeColorSwitch(exigJSON[exigNo].Status);

        const newContainerExigElement = document.createElement("div");
        newContainerExigElement.setAttribute("class", "container-fluid p-3 border bg-light");
        newContainerExigElement.setAttribute("style", "font-size: 30px;");

        const dataExig = [exigJSON[exigNo].Status, "Exigence ".concat(exigJSON[exigNo].Cle_Exigence).concat(" : "), "Description: ".concat(exigJSON[exigNo].Description)];
        const columnsExig = [0, 1, 2];
        const columnsExigLen = columnsExig.length;
        var RowExigElement;
        var ColExigElement;

        for (let i = 1; i < columnsExigLen; i++) {
            RowExigElement = document.createElement("div");
            RowExigElement.setAttribute("class", "row");
            for (let j = 0; j < columnsExig[i] - columnsExig[i - 1]; j++) {
                ColExigElement = document.createElement("div");
                ColExigElement.setAttribute("class", "col");
                ColExigElement.appendChild(document.createTextNode(dataExig[columnsExig[i - 1] + j + 1]));
                if (i + j == 1) {
                    var nameColExigElementStatus = document.createElement("span");
                    nameColExigElementStatus.setAttribute("class", badgeColor);
                    nameColExigElementStatus.appendChild(document.createTextNode(dataExig[0]));
                    ColExigElement.appendChild(nameColExigElementStatus);
                }
                RowExigElement.appendChild(ColExigElement);
            }
            newContainerExigElement.appendChild(RowExigElement);
        }

        var newColTestElement;
        var newContainerTestElement;
        var dataTest;
        var RowTestElement;
        var ColTestElement;

        const newColTestElementList = document.createElement("ul");
        newColTestElementList.setAttribute("class", "list-group");

        const newColTestElementBox = document.createElement("div");
        newColTestElementBox.setAttribute("class", "col");
        newColTestElementBox.setAttribute("style", "max-height:30vh; overflow-y: scroll;");

        for (let testNo = 0; testNo < testJSONLen; testNo++) {
            testTags = testJSON[testNo].Etiquettes.split("tag:\"");
            for (let j = 1; j < testTags.length; j++) {
                testTags[j] = testTags[j].split('\"')[0];
            }
            testTags.sort();

            if ((filters[0] == "0" || filters[0] == testJSON[testNo].Status) && (filters[1] == "0" || filters[1] == testJSON[testNo].Priorite) && (filters[2] == "0" || filters[2] == testJSON[testNo].Type) && (filters[3].length == 0 || findCommonElement(filters[3], testTags))) {
                if (testJSON[testNo].Cle_Exigence == exigJSON[exigNo].Cle_Exigence) {

                    newColTestElement = document.createElement("div");
                    newColTestElement.setAttribute("class", "col-4");
                    newColTestElement.setAttribute("style", "max-height:30vh; overflow-y: scroll;");

                    badgeColor = badgeColorSwitch(testJSON[testNo].Status);
                    newContainerTestElement = document.createElement("div");
                    newContainerTestElement.setAttribute("class", "container-fluid p-3 border bg-light");
                    newContainerTestElement.setAttribute("style", "font-size: 30px;");

                    dataTest = [testJSON[testNo].Status, "Test ".concat(testJSON[testNo].Cle_Test).concat(" : "), testJSON[testNo].Type, "Description: ".concat(testJSON[testNo].Description)];
                    const columnsTest = [0, 1, 2, 3];
                    const columnsTestLen = columnsTest.length;

                    for (let i = 1; i < columnsTestLen; i++) {
                        RowTestElement = document.createElement("div");
                        RowTestElement.setAttribute("class", "row");
                        for (let j = 0; j < columnsTest[i] - columnsTest[i - 1]; j++) {
                            ColTestElement = document.createElement("div");
                            ColTestElement.setAttribute("class", "col");
                            ColTestElement.appendChild(document.createTextNode(dataTest[columnsTest[i - 1] + j + 1]));
                            if (i + j == 1) {
                                var nameColTestElementStatus = document.createElement("span");
                                nameColTestElementStatus.setAttribute("class", badgeColor);
                                nameColTestElementStatus.appendChild(document.createTextNode(dataTest[0]));
                                ColTestElement.appendChild(nameColTestElementStatus);
                            }
                            RowTestElement.appendChild(ColTestElement);
                        }
                        newContainerTestElement.appendChild(RowTestElement);
                    }
                    newColTestElement.appendChild(newContainerTestElement);

                    var newColExecElement;
                    var newContainerExecElement;
                    var dataExec;
                    var RowExecElement;
                    var ColExecElement;

                    const newColExecElementList = document.createElement("ul");
                    newColExecElementList.setAttribute("class", "list-group");

                    const newColExecElementBox = document.createElement("div");
                    newColExecElementBox.setAttribute("class", "col");
                    newColExecElementBox.setAttribute("style", "max-height:30vh; overflow-y: scroll;");

                    for (let execNo = 0; execNo < execJSONLen; execNo++) {

                        if (execJSON[execNo].Cle_Test == testJSON[testNo].Cle_Test) {
                            newColExecElement = document.createElement("div");
                            newColExecElement.setAttribute("class", "col-6");
                            newColExecElement.setAttribute("style", "max-height:30vh; overflow-y: scroll;");

                            badgeColor = badgeColorSwitch(execJSON[execNo].Status);
                            newContainerExecElement = document.createElement("div");
                            newContainerExecElement.setAttribute("class", "container-fluid p-3 border bg-light");
                            newContainerExecElement.setAttribute("style", "font-size: 30px;");

                            dataExec = [execJSON[execNo].Status, "Execution ".concat(execJSON[execNo].Cle_Execution).concat(" : "), "Fin: ".concat(execJSON[execNo].Date_de_fin), "Executeur: ".concat(execJSON[execNo].Executeur), "Environnement: ".concat(execJSON[execNo].Environnement)];
                            const columnsExec = [0, 1, 2, 3, 4];
                            const columnsExecLen = columnsExec.length;

                            for (let i = 1; i < columnsExecLen; i++) {
                                RowExecElement = document.createElement("div");
                                RowExecElement.setAttribute("class", "row");
                                for (let j = 0; j < columnsExec[i] - columnsExec[i - 1]; j++) {
                                    ColExecElement = document.createElement("div");
                                    ColExecElement.setAttribute("class", "col");
                                    ColExecElement.appendChild(document.createTextNode(dataExec[columnsExec[i - 1] + j + 1]));
                                    if (i + j == 1) {
                                        var nameColExecElementStatus = document.createElement("span");
                                        nameColExecElementStatus.setAttribute("class", badgeColor);
                                        nameColExecElementStatus.appendChild(document.createTextNode(dataExec[0]));
                                        ColExecElement.appendChild(nameColExecElementStatus);
                                    }
                                    RowExecElement.appendChild(ColExecElement);
                                }
                                newContainerExecElement.appendChild(RowExecElement);
                            }
                            newColExecElement.appendChild(newContainerExecElement);

                            var newColDefautElement = document.createElement("div");
                            newColDefautElement.setAttribute("class", "col");
                            newColDefautElement.setAttribute("style", "max-height:20vh; overflow-y: scroll;");;
                            var newContainerDefautElement;
                            var dataDefaut;
                            var RowDefautElement;
                            var ColDefautElement;
                            const columnsDefaut = [0, 1, 2];
                            const columnsDefautLen = columnsDefaut.length;

                            const newColDefautElementList = document.createElement("ul");
                            newColDefautElementList.setAttribute("class", "list-group");

                            const newColDefautElementBox = document.createElement("div");
                            newColDefautElementBox.setAttribute("class", "col");
                            newColDefautElementBox.setAttribute("style", "max-height:30vh; overflow-y: scroll;");

                            if (execJSON[execNo].Status == "FAILED") {
                                for (let defautNo = 0; defautNo < defautJSONLen; defautNo++) {
                                    if (defautJSON[defautNo].Cle_Execution == execJSON[execNo].Cle_Execution) {
                                        newColDefautElement = document.createElement("div");
                                        newColDefautElement.setAttribute("class", "col");
                                        newColDefautElement.setAttribute("style", "max-height:30vh; overflow-y: scroll;");

                                        badgeColor = badgeColorSwitch("FAILED");

                                        newContainerDefautElement = document.createElement("div");
                                        newContainerDefautElement.setAttribute("class", "container-fluid p-3 border bg-light");
                                        newContainerDefautElement.setAttribute("style", "font-size: 30px;");

                                        dataDefaut = ["FAILED", "Defaut ".concat(defautJSON[defautNo].Cle_Defaut).concat(" : "), "Description: ".concat(defautJSON[defautNo].Description)];

                                        for (let i = 1; i < columnsDefautLen; i++) {
                                            RowDefautElement = document.createElement("div");
                                            RowDefautElement.setAttribute("class", "row");
                                            for (let j = 0; j < columnsDefaut[i] - columnsDefaut[i - 1]; j++) {
                                                ColDefautElement = document.createElement("div");
                                                ColDefautElement.setAttribute("class", "col");
                                                ColDefautElement.appendChild(document.createTextNode(dataDefaut[columnsDefaut[i - 1] + j + 1]));
                                                if (i + j == 1) {
                                                    var nameColDefautElementStatus = document.createElement("span");
                                                    nameColDefautElementStatus.setAttribute("class", badgeColor);
                                                    nameColDefautElementStatus.appendChild(document.createTextNode(dataDefaut[0]));
                                                    ColDefautElement.appendChild(nameColDefautElementStatus);
                                                }
                                                RowDefautElement.appendChild(ColDefautElement);
                                            }
                                            newContainerDefautElement.appendChild(RowDefautElement);
                                        }
                                        newColDefautElement.appendChild(newContainerDefautElement);
                                    }
                                }
                            }

                            const newRowExecElementBox = document.createElement("div");
                            newRowExecElementBox.setAttribute("class", "row");
                            newRowExecElementBox.appendChild(newColExecElement);
                            newRowExecElementBox.appendChild(newColDefautElement);

                            const newListExecElement = document.createElement("li");
                            newListExecElement.setAttribute("class", "list-group-item");
                            newListExecElement.appendChild(newRowExecElementBox);
                            newColExecElementList.appendChild(newListExecElement);

                            newColExecElementBox.appendChild(newColExecElementList);
                        }
                    }
                    const newRowTestElementBox = document.createElement("div");
                    newRowTestElementBox.setAttribute("class", "row");
                    newRowTestElementBox.appendChild(newColTestElement);
                    newRowTestElementBox.appendChild(newColExecElementBox);

                    const newListTestElement = document.createElement("li");
                    newListTestElement.setAttribute("class", "list-group-item");
                    newListTestElement.appendChild(newRowTestElementBox);
                    newColTestElementList.appendChild(newListTestElement);

                    newColTestElementBox.appendChild(newColTestElementList);
                }
            }

        }

        const newColExigElement = document.createElement("div");
        newColExigElement.setAttribute("class", "col-3");
        newColExigElement.appendChild(newContainerExigElement);


        const newRowElement = document.createElement("div");
        newRowElement.setAttribute("class", "row");
        newRowElement.appendChild(newColExigElement);
        newRowElement.appendChild(newColTestElementBox);

        const newListElement = document.createElement("li");
        newListElement.setAttribute("class", "list-group-item");
        newListElement.appendChild(newRowElement);

        currentLastDiv = document.getElementById("tracability-report-end");
        parentDiv = document.getElementById("tracability-report");
        parentDiv.insertBefore(newListElement, currentLastDiv);
    }
}

function initPage(initialized) {
    const filters = globalFilters;
    fetch('./JsonFiles/ListeTests.json', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json())
        .then(response => {
            const responseTest = response;
            fetch('./JsonFiles/ListeExecutions.json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then(response => response.json())
                .then(response => {
                    const responseExec = response;

                    fetch('./JsonFiles/ListeExigences.json', {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                    })
                        .then(response => response.json())
                        .then(response => {
                            const responseExig = response;

                            fetch('./JsonFiles/ListeDefauts.json', {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                },
                            })
                                .then(response => response.json())
                                .then(response => {
                                    const responseDefaut = response;
                                    if (!initialized) {
                                        addFilters(responseTest);
                                    }
                                    if (globalSortingFunction[0]){
                                        responseExec.sort(globalSortingFunction[1]);
                                    } else {
                                        responseTest.sort(globalSortingFunction[1]);
                                    }
                                    addElementCoverageReport(responseTest, filters);
                                    addElementTestListReport(responseTest, responseExec, filters);
                                    addElementTracabilityReport(responseTest, responseExec, responseExig, responseDefaut, filters);
                                });
                        });
                });
        });
}

function filterReports() {
    var filters = [];
    filters.push(document.getElementById("inputGroup-Filters-SelectStatus").value);
    filters.push(document.getElementById("inputGroup-Filters-SelectPriorite").value);
    filters.push(document.getElementById("inputGroup-Filters-SelectTestType").value);
    var filterTagsList = document.getElementById("inputGroup-Filters-SelectEtiquette").getElementsByTagName('li');
    const filterTagsListLen = filterTagsList.length;
    filters.push([]);
    for (let i = 0; i < filterTagsListLen; i++) {
        if (filterTagsList[i].firstChild.firstChild.firstChild.checked) {
            filters[3].push(filterTagsList[i].firstChild.firstChild.lastChild.textContent);
        }
    }
    globalFilters = filters;
    initPage(true);
}

function sortReports() {
    var sortingChoice = document.getElementById("inputGroup-Sorting-Select").value.split('-');
    var sortingFunctions = [function (a, b) { return parseInt(a.Cle_Test) - parseInt(b.Cle_Test) },
        function (a, b) { return parseInt(b.Cle_Test) - parseInt(a.Cle_Test) },
        function (a, b) { return a.Status.localeCompare(b.Status) },
        function (a, b) { return b.Status.localeCompare(a.Status) },
        function (a, b) { return a.Type.localeCompare(b.Type) },
        function (a, b) { return b.Type.localeCompare(a.Type) },
        function (a, b) { return parseInt(a.Priorite) - parseInt(b.Priorite) },
        function (a, b) { return parseInt(b.Priorite) - parseInt(a.Priorite) },
        function (a, b) { return a.Date_de_debut.localeCompare(b.Date_de_debut) },
        function (a, b) { return b.Date_de_debut.localeCompare(a.Date_de_debut) }];
    let i = 2 * [ "Nom", "Status", "Type", "Priorite", "Date"].indexOf(sortingChoice[0]) + ["down", "up"].indexOf(sortingChoice[1]);
    globalSortingFunction = [(i > 7), sortingFunctions[i]];
    initPage(true);
}

window.addEventListener("load", initPage(false));

const buttonSaveChangeFilters = document.getElementById("saveChangesFilters");
buttonSaveChangeFilters.addEventListener("click", filterReports);

const buttonSaveChangeSorting = document.getElementById("saveChangesSorting");
buttonSaveChangeSorting.addEventListener("click", sortReports);