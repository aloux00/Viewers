const getAllSRSeries = () => {
    const enhancedSRclassUid = '1.2.840.10008.5.1.4.1.1.88.22';
    const allStudies = OHIF.viewer.StudyMetadataList.all();
    const srSeries = [];

    allStudies.forEach(study => {
        study.getSeries().forEach(series => {
            const firstInstance = series.getFirstInstance();
            const sopClassUid = firstInstance._instance.sopClassUid;

            if (sopClassUid === enhancedSRclassUid) {
                srSeries.push(series);
            }
        });
    });

    return srSeries;
};


const getLatestSRSeries = () => {
    let latestSeries;
    const allSeries = getAllSRSeries();

    for (series of allSeries) {
        if(!latestSeries) {
            latestSeries = series;
            continue;
        }
        if (series._data.seriesDate > latestSeries._data.seriesDate ||
           (series._data.seriesDate === latestSeries._data.seriesDate && series._data.seriesTime > latestSeries._data.seriesTime)) {
            latestSeries = series;
        }
    }

    return latestSeries;
};

//
// return a post-able multipart encoded dicom from the blob
//
const multipartEncode = (dataset, boundary) => {

    const denaturalizedMetaheader = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset._meta);
    const dicomDict = new dcmjs.data.DicomDict(denaturalizedMetaheader);

    dicomDict.dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset);

    const part10Buffer = dicomDict.write();

    const header = `\r\n--${boundary}\r\nContent-Type: application/dicom\r\n\r\n`;
    const footer = `\r\n--${boundary}--`;

    const stringToArray = (string) => Uint8Array.from(Array.from(string).map(letter => letter.charCodeAt(0)));

    headerArray = stringToArray(header);
    contentArray = new Uint8Array(part10Buffer);
    footerArray = stringToArray(footer);

    const multipartArray = new Uint8Array(headerArray.length + contentArray.length + footerArray.length);

    multipartArray.set(headerArray, 0);
    multipartArray.set(contentArray, headerArray.length);
    multipartArray.set(footerArray, headerArray.length + contentArray.length);

    return(multipartArray.buffer);
};
const getSTOWUrl = () => {
    const server = OHIF.servers.getCurrentServer();
    return `${server.wadoRoot}/studies`;
};

export {
    getAllSRSeries,
    getLatestSRSeries,
    multipartEncode,
    getSTOWUrl,
}
