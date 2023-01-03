import { Component } from "react";
import { connect } from "react-redux";
import { Fragment } from "react";
import BordersFieldModalContent from "./SearchTableModalsCotent/BordersFieldModalContent";
import BordersPlanModalContent from "./SearchTableModalsCotent/BordersPlanModalContent";
import AtmModalContent from "./SearchTableModalsCotent/ATMModalContent";
import BuildingDataContent from "./SearchTableModalsCotent/BuildingDataContent";
import BuildingDetailsContent from "./SearchTableModalsCotent/BuildingDetailsContent";
import TowersModalContent from "./SearchTableModalsCotent/TowerModalCotnent";
import ElecStationsModalContent from "./SearchTableModalsCotent/ElecStationsModalContent";
import ADGroupModalContent from "./SearchTableModalsCotent/ADGroupModalContent";
import BuildingImgModalContent from "./SearchTableModalsCotent/BuildingImgModalContent";
import CoordinateContent from "./SearchTableModalsCotent/CoordinatesContent";

class SearchTableIconModal extends Component {
  render() {
    const {
      selectedFeatureOnSearchTable,
      closeModal,
      openLoader,
      closeLoader,
    } = this.props;
    if (!selectedFeatureOnSearchTable) return <Fragment></Fragment>;
    else if (selectedFeatureOnSearchTable.name == "Border_Field_Info") {
      return (
        <BordersFieldModalContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name == "Border_Plan_Info") {
      return (
        <BordersPlanModalContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "ADGroup_Info") {
      return (
        <ADGroupModalContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "ATM_Info") {
      return (
        <AtmModalContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "Building_Data_Info") {
      return (
        <BuildingDataContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "Building_Details_Info") {
      return (
        <BuildingDetailsContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "Building_Images") {
      return (
        <BuildingImgModalContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "Tower_Info") {
      return (
        <TowersModalContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "Elec_Stations_Info") {
      return (
        <ElecStationsModalContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    } else if (selectedFeatureOnSearchTable.name === "Coordinate_Info") {
      return (
        <CoordinateContent
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
        />
      );
    }
    else return null;
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  const { selectedFeatureOnSearchTable } = mapUpdate;
  return {
    selectedFeatureOnSearchTable,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => dispatch({ type: "CLOSE_TABLE_ICON_MODAL" }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchTableIconModal);
