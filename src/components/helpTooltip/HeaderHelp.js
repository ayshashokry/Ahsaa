import React from "react";
import ReactJoyride, {
  STATUS,
  ACTIONS,
  EVENTS,
  LIFECYCLE,
} from "react-joyride";
export default function HeaderHelp(props) {
  const handleJoyrideCallback = (data) => {
    const { status, type, action } = data;
    if ([EVENTS.TOUR_END].includes(type)) {
      props.routeName === "contactcall" ? (
        localStorage.setItem("showContactHelp", true)
      ) : props.routeName === "updateLocation" ? (
        localStorage.setItem("showUpdateLocationHelp", true)
      ) : props.routeName === "feasibilityStudy" ? (
        localStorage.setItem("showFesStudyHelp", true)
      ) : props.routeName === "search" ||
        props.routeName === "generalSearch" ? (
        localStorage.setItem("showsearchHelp", true)
      ) : props.routeName === "dashboard" ? (
        localStorage.setItem("showdashboardHelp", true)
      ) : props.routeName === "InvestmentReport" ? (
        localStorage.setItem("showreportsHelp", true)
      ) : (
        <></>
      );
    }
    if ([LIFECYCLE.COMPLETE].includes(type)) {
      props.routeName === "contactcall" ? (
        localStorage.setItem("showContactHelp", true)
      ) : props.routeName === "updateLocation" ? (
        localStorage.setItem("showUpdateLocationHelp", true)
      ) : props.routeName === "feasibilityStudy" ? (
        localStorage.setItem("showFesStudyHelp", true)
      ) : props.routeName === "search" ||
        props.routeName === "generalSearch" ? (
        localStorage.setItem("showsearchHelp", true)
      ) : props.routeName === "dashboard" ? (
        localStorage.setItem("showdashboardHelp", true)
      ) : props.routeName === "InvestmentReport" ? (
        localStorage.setItem("showreportsHelp", true)
      ) : (
        <></>
      );
    }
    if ([STATUS.SKIPPED].includes(status)) {
      props.routeName === "contactcall" ? (
        localStorage.setItem("showContactHelp", true)
      ) : props.routeName === "updateLocation" ? (
        localStorage.setItem("showUpdateLocationHelp", true)
      ) : props.routeName === "feasibilityStudy" ? (
        localStorage.setItem("showFesStudyHelp", true)
      ) : props.routeName === "search" ||
        props.routeName === "generalSearch" ? (
        localStorage.setItem("showsearchHelp", true)
      ) : props.routeName === "dashboard" ? (
        localStorage.setItem("showdashboardHelp", true)
      ) : props.routeName === "InvestmentReport" ? (
        localStorage.setItem("showreportsHelp", true)
      ) : (
        <></>
      );
    }
    if ([ACTIONS.CLOSE].includes(action)) {
      props.routeName === "contactcall" ? (
        localStorage.setItem("showContactHelp", true)
      ) : props.routeName === "updateLocation" ? (
        localStorage.setItem("showUpdateLocationHelp", true)
      ) : props.routeName === "feasibilityStudy" ? (
        localStorage.setItem("showFesStudyHelp", true)
      ) : props.routeName === "search" ||
        props.routeName === "generalSearch" ? (
        localStorage.setItem("showsearchHelp", true)
      ) : props.routeName === "dashboard" ? (
        localStorage.setItem("showdashboardHelp", true)
      ) : props.routeName === "InvestmentReport" ? (
        localStorage.setItem("showreportsHelp", true)
      ) : (
        <></>
      );
    }
  };
  let helpSteps =
    props.routeName === "dashboard"
      ? [
          {
            target: ".dashboardHelp",
            disableBeacon: true,
            content: "الاحصائيات",
          },
        ]
      : props.routeName === "InvestmentReport"
      ? [
          {
            target: ".reportsHelp",
            disableBeacon: true,
            content: "التقارير",
          },
        ]
      : props.routeName === "contactcall"
      ? [
          {
            target: ".headercallUsHelp",
            disableBeacon: true,
            content: "اتصل بنا",
          },
          {
            target: ".headermessageHelp ",
            content: "راسلنا",
          },
        ]
      : props.routeName === "feasibilityStudy"
      ? [
          {
            target: ".headerFesNotesHelp",
            disableBeacon: true,
            content: "ملاحظات",
          },
          {
            target: ".headerFesSuggestHelp ",
            content: "اقتراحات",
          },
          { target: ".headerEcoStudyHelp", content: "الدراسة التخطيطية" },
        ]
      : props.routeName === "search" || props.routeName === "generalSearch"
      ? [
          {
            target: ".headerGeneralSearchHelp",
            disableBeacon: true,
            content: "بحث عن الفرص الأستثمرية  (معلنة-شاغرة-مستثمرة)",
          },
          {
            target: ".headerCooSearchHelp",
            content: "بحث بالأحداثيات (جغرافية-مترية)",
          },
          {
            target: ".headernearLocationHelp",
            content: "البحث عن اقرب موقع استثماري محيط",
          },
        ]
      : props.routeName === "updateLocation"
      ? [
          {
            target: ".headerUpdateLocInfoHelp",
            disableBeacon: true,
            content: "تعديل بيانات الموقع",
          },
          {
            target: ".headeraddLocationChartsHelp",
            content: "إضافة موقع من طبقة الأراضي",
          },
          {
            target: ".headeraddLocationCadsHelp",
            content: "إضافة موقع من الرسم الهندسي",
          },
        ]
      : null;
  return (
    <>
      {props.routeName === "contactcall" ||
      props.routeName === "dashboard" ||
      props.routeName === "InvestmentReport" ||
      props.routeName === "updateLocation" ||
      props.routeName === "feasibilityStudy" ||
      props.routeName === "search" ||
      props.routeName === "generalSearch" ? (
        <ReactJoyride
          locale={{
            back: "السابق",
            close: "إغلاق",
            last: "الأخيرة",
            next: "التالي",
          }}
          callback={handleJoyrideCallback}
          steps={helpSteps}
          disableCloseOnEsc
          run={true}
          continuous
          showProgress
          disableOverlayClose
          showSkipButton
          styles={{
            options: {
              arrowColor: "rgba(255, 255, 255, .9)",
              backgroundColor: "rgba(255, 255, 255, .9)",
              overlayColor: "rgba(31, 75, 89, .4)",
              primaryColor: "#000",
              textColor: "#1f4b59",
              zIndex: 9000000,
            },
          }}
        />
      ) : null}
    </>
  );
}
