/*******************************************************************************
 * Business Category :
 * Screen ID : CompaniesWorklist.js
 * Screen Name : 
 * Created Date :  2026. 9. 18. 오후 2:58:28
 * Creator : ryu
 * Revision History
 *******************************************************************************
 * Date				Name				Description
 *******************************************************************************
 * 
 *******************************************************************************/

/*******************************************************************************
 * Common Module Area
 *******************************************************************************/
 
 
/*******************************************************************************
 * Business Common Module Area
 *******************************************************************************/
 
 
/*******************************************************************************
 * Local Variable Declarations within File
 *******************************************************************************/
 
 
/*******************************************************************************
 * Onload and Submission Call Area
 * (Contains related events and submission calls, along with callback functions invoked upon screen loading.)
 *******************************************************************************/
 
 
/*******************************************************************************
 * Validation Check Area
 *******************************************************************************/

 
/*******************************************************************************
 * User-Defined JavaScript Functions
 *******************************************************************************/
 
 
/*******************************************************************************
 * Automatically Generated Event JavaScript Functions
 * (Event functions are automatically displayed below when events are created.)
 *******************************************************************************/

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	app.lookup("udcBarChart01").dataSet = app.lookup("dsBar01");
	app.lookup("udcBarChart01").drawChart();

	app.lookup("udcBarChart02").dataSet = app.lookup("dsBar02");
	app.lookup("udcBarChart02").drawChart();

	app.lookup("udcDonutChart").dataSet = app.lookup("dsDonut");
	app.lookup("udcDonutChart").drawChart();
}
