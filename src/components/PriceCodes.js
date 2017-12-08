/**
 * Created by steve on 8/24/2016.
 */

import React, {Component} from 'react';
import CompanySelect from './CompanySelect';
import PriceLevelSelect from './PriceLevelSelect';
import PriceCodesTable from './PriceCodesTable'
import PriceCodeItems from './PriceCodeItems'
import ProgressBar from './ProgressBar';
import classNames from 'classnames';
import {connect} from 'react-redux';
import PropTypes from 'proptypes';
import {
    clearError,
    fetchPriceCodes, fetchPriceLevel, selectPriceCode, setCompany, setNewDiscountMarkup, setPriceLevel
} from "../actions/priceCodes";
import DismissableAlert from "./DismissableAlert";


class PriceCodes extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        company: PropTypes.string.isRequired,
        list: PropTypes.object.isRequired,
        error: PropTypes.string,
        levelList: PropTypes.object.isRequired,
        loading: PropTypes.bool,
        priceLevel: PropTypes.string.isRequired,
        loadingItems: PropTypes.bool,
    };

    constructor() {
        super();

        this.state = {
            filter: '',
            filterChanged: false,
        };
    }

    componentDidMount() {
        this.loadPriceCodes();
    }

    changeCompany(company) {
        this.props.dispatch(setCompany(company));
        this.loadPriceCodes();
    }

    changePriceLevel(priceLevel) {
        this.props.dispatch(setPriceLevel(priceLevel));
        this.props.dispatch(fetchPriceLevel());
    }

    loadPriceLevel() {
        this.props.dispatch(fetchPriceLevel());
    }

    onClickShowChanged() {
        this.setState({filterChanged: !this.state.filterChanged});
    }

    changeItemFilter(ev) {
        this.setState({filter: ev.target.value});
    }

    changePriceCode(priceCode) {
        const {dispatch, priceLevel} = this.props;
        dispatch(selectPriceCode({...priceCode, CustomerPriceLevel: priceLevel}));
    }

    loadPriceCodes(callback) {
        this.props.dispatch(fetchPriceCodes());
    }

    onChangeDiscount(val) {
        this.props.dispatch(setNewDiscountMarkup(val));
    }

    onDismissError(index) {
        this.props.dispatch(clearError(index));
    }

    render() {
        const {company, loading, priceLevel, errors, levelList, loadingItems, levels, items} = this.props;
        const {filterChanged, filter} = this.state;
        const alerts = errors.map((error, index) => {
            return (
                <DismissableAlert key={index} message={error} onDismiss={this.onDismissError.bind(this, index)}/>
            )
        });
        return (
            <div className={classNames({loading}, "row")}>
                <div className="col-md-6">
                    {alerts}
                    <form className ="form-inline form-group" onSubmit={(ev) => {ev.preventDefault()}}>
                        <CompanySelect value={company} onChange={::this.changeCompany}/>
                        <PriceLevelSelect company={company}
                                          value={priceLevel}
                                          values={levels}
                                          onChange={::this.changePriceLevel}/>
                        <input type="text" className="form-control form-control-sm"
                               placeholder="filter code"
                               value={filter}
                               onChange={::this.changeItemFilter} />
                        <button onClick={::this.loadPriceLevel} className="btn btn-primary btn-sm" type="button">Load</button>
                        <button onClick={::this.onClickShowChanged}
                                className={classNames("btn btn-sm", {'btn-secondary': filterChanged, 'btn-outline-secondary': !filterChanged})}
                                type="button">Changed</button>

                    </form>
                    <ProgressBar visible={loading} active={true} striped={true} />
                    <PriceCodesTable priceCodes={levelList}
                                     filter={filter}
                                     filterChanged={filterChanged}
                                     selected={this.props.selected}
                                     onClick={::this.changePriceCode}/>
                </div>
                <div className="col-md-6">
                    <ProgressBar visible={loadingItems} active={true} striped={true} />
                    <PriceCodeItems priceCode={this.props.selected || {}}
                                    priceLevel={priceLevel}
                                    items={items}
                                    onChange={::this.onChangeDiscount}/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { company, loading, list, levelList, errors, priceLevel, items, selected, loadingItems, levels } = state.priceCodes;
    return { company, loading, list, levelList, errors, priceLevel, items, selected, loadingItems, levels };
};

export default connect(mapStateToProps)(PriceCodes);