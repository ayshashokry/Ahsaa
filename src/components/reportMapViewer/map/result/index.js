import React, { Component } from 'react'
import { mapStateToProps } from './mapping'
import Header from './header'
import { get } from 'lodash'
import { connect } from 'react-redux'


export class identifyResult extends Component {
  state = {
    expanded: false
  }
  handleExpandChange = (expanded) => {
    this.setState({
      expanded: expanded,
      ...this.props.tableSettings
    });
  };

  render() {

    const { list, index, header, views } = this.props
    const data = list[index]
    return (
      <div>
        <Header />
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

export default connect(mapStateToProps)(identifyResult)
