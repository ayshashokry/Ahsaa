import React, { Component } from 'react'
import { mapStateToProps } from './mapping'
import { get } from 'lodash'
import { connect } from 'react-redux'


export class IdentifyResult extends Component {
  state = {
    expanded: false
  }
  handleExpandChange = (expanded) => {
    this.setState({
      expanded
    });
  };

  render() {
    // you have to refer to the mapping file
    // the store has to contain a property `mapViewer`
    // the property contains the following: 
    // list, header, views, resultIndex
    // so after fetching data you have to populate these to the STORE...
    const { list, index, header, views } = this.props
    const data = list[index]
    return (
      <div>
        <section>
          <section>
            <table className="table table-no-bordered table-identify" style={{ marginTop: '35px' }} >
              <tbody>
                {
                  header.map((head, index) => (
                    <tr key={index}>
                      <td className='col-sm-10'>{get(data.attributes, views[index], 'غير متوفر') || 'غير متوفر'}</td>
                      <td className='col-sm-2'>{head}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </section>
        </section>
      </div>
    )
  }
}

export default connect(mapStateToProps)(IdentifyResult)
