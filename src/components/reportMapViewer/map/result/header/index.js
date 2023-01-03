import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from './mapping'
import { withRouter } from 'react-router'
class Header extends Component {
  goBack () {
    const {history} = this.props
    history.goBack()
  }
  render () {
    const {t, list, index, setResult} = this.props
    const length = list.length
    return (
      <div className='header-map' style={{ zoom: .8 }}>
        <div className='col-1-map'>
          <div className='right-col-1-map'>
            
            <button className='btn map-side' onClick={this.goBack.bind(this)}>
              <span><i className='fa fa-chevron-left'></i></span>
            </button>

            {list && length && <div className='identify-back'>
             {index > 0 && <button className='btn map-side' onClick={setResult.bind(this, index - 1)}>
                                                 <span><i className='fa fa-arrow-left'></i></span>
                                               </button>}
                                 {index < (length - 1) && <button className='btn map-side' onClick={setResult.bind(this, index + 1)}>
                                                            <span><i className='fa fa-arrow-right'></i></span>
                                                          </button>}
                                
                               </div>}
            
          </div>
          <div className='center-col-2-map'>
            <span style={{ fontSize: '25px' }}>{t('map')}</span>
          </div>
        </div>
      </div>
    )
  }
}

const header = translate('translations')(Header)
export default translate("translations")(withRouter(connect(mapStateToProps, mapDispatchToProps)(header)))
