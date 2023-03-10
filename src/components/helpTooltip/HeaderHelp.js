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
            content: "????????????????????",
          },
        ]
      : props.routeName === "InvestmentReport"
      ? [
          {
            target: ".reportsHelp",
            disableBeacon: true,
            content: "????????????????",
          },
        ]
      : props.routeName === "contactcall"
      ? [
          {
            target: ".headercallUsHelp",
            disableBeacon: true,
            content: "???????? ??????",
          },
          {
            target: ".headermessageHelp ",
            content: "????????????",
          },
        ]
      : props.routeName === "feasibilityStudy"
      ? [
          {
            target: ".headerFesNotesHelp",
            disableBeacon: true,
            content: "??????????????",
          },
          {
            target: ".headerFesSuggestHelp ",
            content: "????????????????",
          },
          { target: ".headerEcoStudyHelp", content: "?????????????? ??????????????????" },
        ]
      : props.routeName === "search" || props.routeName === "generalSearch"
      ? [
          {
            target: ".headerGeneralSearchHelp",
            disableBeacon: true,
            content: "?????? ???? ?????????? ????????????????????  (??????????-??????????-??????????????)",
          },
          {
            target: ".headerCooSearchHelp",
            content: "?????? ?????????????????????? (??????????????-??????????)",
          },
          {
            target: ".headernearLocationHelp",
            content: "?????????? ???? ???????? ???????? ???????????????? ????????",
          },
        ]
      : props.routeName === "updateLocation"
      ? [
          {
            target: ".headerUpdateLocInfoHelp",
            disableBeacon: true,
            content: "?????????? ???????????? ????????????",
          },
          {
            target: ".headeraddLocationChartsHelp",
            content: "?????????? ???????? ???? ???????? ??????????????",
          },
          {
            target: ".headeraddLocationCadsHelp",
            content: "?????????? ???????? ???? ?????????? ??????????????",
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
            back: "????????????",
            close: "??????????",
            last: "??????????????",
            next: "????????????",
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
