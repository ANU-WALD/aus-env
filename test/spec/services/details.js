'use strict';

describe('Service: details', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var details;
  beforeEach(inject(function (_details_) {
    details = _details_;
  }));

  var sampleHeader = 'Title,Area bare soil\n\
Regions,States & Ternitories\n\
Description,Annual mean area of bare soil.\n\
InputFile,au/FractCov/BS/FractCover.V3_0_1.AnnualMeans.aust.005.BS.nc\n\
RegionCode,STATE_CODE\n\
RegionLabels,See file STE_codes.csv to match RegionCode to region name.\n\
ColumnLabels,Year\n\
Units,km2\n\
NoDataValue,-9999\n\
Produced,05-Mar-2016 19:08:20\n\
AuthorEmail,bob@sample-domain.com\n'
  var sampleSplitter = '------------------------------------------ \n';
  var sampleBody = '-9999, 2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014, 2015\n\
0,1.404e+05,1.7564e+05,2.2847e+05,2.3014e+05,2.2455e+05,2.1887e+05,2.2196e+05,2.3168e+05,2.4674e+\n05,2.4756e+05,1.879e+05,1.5554e+05,1.6283e+05,1.846e+05,1.9703e+05,2.0174e+05\n\
1,25763,28505,33829,35575,31882,32588,34972,37479,37727,36128,30094,28457,30627,31658,31063,33960\n\
2,3.2723e+05,3.8866e+05,4.919e+05,5.2062e+05,4.9543e+05,5.3422e+05,5.2902e+05,5.167e+05,4.9722e+05,4.5981e+05,3.6839e+05,3.319e+05,3.7369e+05,4.7104e+05,5.0361e+05,5.4344e+05\n\
3,4.2211e+05,4.534e+05,4.6698e+05,4.8708e+05,4.8126e+05,4.9716e+05,5.0754e+05,5.1232e+05,5.4013e+05,5.3244e+05,4.7634e+05,4.1456e+05,4.4232e+05,4.7457e+05,4.754e+05,4.8416e+05\n\
4,7.6872e+05,9.4343e+05,1.0222e+06,1.0887e+06,1.0077e+06,1.0869e+06,9.7874e+05,1.0496e+06,1.0874e+06,1.0935e+06,1.1339e+06,9.6996e+05,9.9407e+05,1.0953e+06,1.0654e+06,1.0566e+06\n\
5,3021.8,3323.3,3721.6,3743.4,3598.2,3661.8,3723.9,3674.8,4078.4,3681.8,3931.2,3511.5,3819.4,3609.4,3681.3,4099.3\n\
6,3.5383e+05,3.9083e+05,4.7091e+05,5.1022e+05,4.8563e+05,5.6182e+05,4.9733e+05,4.9809e+05,5.6716e+05,5.2656e+05,4.623e+05,3.874e+05,4.8194e+05,5.5076e+05,5.0912e+05,5.1e+05\n\
7,138.7,165.8,197.19,336.5,306.81,265.33,262.2,262.22,256.03,258.54,206.55,186.64,178.49,190.17,190.69,183.79\n\
8,-9999,1.9612,2.4679,2.4937,-9999,-9999,2.5725,-9999,-9999,-9999,-9999,-9999,-9999,-9999,-9999,-9999\n\
9999,-9999,2.384e+06,2.7182e+06,2.8764e+06,-9999,-9999,2.7736e+06,-9999,-9999,-9999,-9999,-9999,-9999,-9999,-9999,-9999\n';

  var sampleCSV = sampleHeader + sampleSplitter + sampleBody;

//  console.log(sampleCSV);

  var headerExpectations = function(parsedHeader) {
    expect(parsedHeader.ColumnLabels).toBe('Year');
    expect(parsedHeader.AuthorEmail).toBe('bob@sample-domain.com');
    expect(parsedHeader.Regions).toBe('States & Ternitories');
  };

  var bodyExpectations = function(parsedBody) {
    expect(parsedBody.columnNames[0]).toBe('2000');
    expect(parsedBody.columnNames.length).toBe(16);
    expect(parsedBody['PlaceIndex0'][0]).toBe(1.404e+05);
    expect(parsedBody['PlaceIndex9999'][15]).toBe(null);
  };

  it('parses key value header', function () {
    expect(!!details).toBe(true);
    var parsedHeader = details.parseKeyValueHeader(sampleHeader.split('\n'));
    headerExpectations(parsedHeader);
  });

  it('parses regular CSV file to arrayed rows', function() {
    var parsed = details.parseRegularCSV(sampleBody);
    bodyExpectations(parsed);
  });

  it('parses regular CSV file to record rows', function() {
    var parsed = details.parseRegularCSV(sampleBody,'',true);
    expect(parsed.columnNames[0]).toBe('2000');
    expect(parsed.columnNames.length).toBe(16);
    expect(parsed['0']['2000']).toBe(1.404e+05);
    expect(parsed['9999']['2015']).toBe(null);
  });

  it('parses whole CSV file',function(){
    var parsedFile = details.parseCSVWithHeader(sampleCSV);
    headerExpectations(parsedFile);
    bodyExpectations(parsedFile);
  });
});
