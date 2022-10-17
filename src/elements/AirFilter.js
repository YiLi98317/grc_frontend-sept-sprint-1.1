

import React, { useEffect, useRef, useState } from "react";
import { Accordion } from "react-bootstrap";
import { compareObjs, DelCookie, isObjInclude } from "../helpers/Helper";
import Styles from "../styles/AirFilter.module.css"



const AirFilter = (props) => {
    const {
        id = "air_multi_sel",
        theme = { style: "light", type: "theme4" },
        className = "",
        dropdownClassName = "",
        displayValue = "key",
        groupBy = "cat",
        onKeyPressFn = null,
        onRemove = null,
        onSearch = null,
        onSelect = null,
        options: filtersList = [],
        selectedValues = [],
        howCheckbox

    } = props

    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState(selectedValues)
    const [showFilterCheck, setShowFilterCheck] = useState(false)
    const editFilterInpRef = useRef({})
    const airFilters = useRef();
    // const wrapperRef = useRef(null);
    useEffect(() => {
        /**
             * Alert if clicked on outside of element
             */
        function handleClickOutside(event) {
            if (airFilters.current && !airFilters.current.contains(event.target)) {
                toggleFilterDropdown(true)
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [airFilters])

    useEffect(() => {
        // let listArr = getListByCategory([...filtersList], groupBy)
        // toggleFilterSelect(listArr, [...selectedValues])
    }, [])
    useEffect(() => {
        if (selectedValues != selectedFilter) {
            setSelectedFilter(oldVal => [...selectedValues])
            setShowFilterCheck(selectedValues.length > 0 ? true : false)
            let listArr = getListByCategory([...filtersList], groupBy)
            toggleFilterSelect(listArr, [...selectedValues])
        }
    }, [selectedValues])

    // console.log(selectedFilter);
    const getListByCategory = (list = null, cat = '') => {
        if (list == null || cat == '') {
            return []
        }

        let tmpData = list.reduce((group, item) => {
            // let cat = item[groupBy]
            let key = item[cat]
            group[key] = group[key] || [];

            group[key].push(item)
            return group
        }, {})
        let result = [];
        if (tmpData) {
            result = Object.entries(tmpData).map(([key, value]) => ({ group: key, list: value }))
        }
        // console.log(result);
        return result
    }
    const toggleFilterDropdown = (hideDropdown = false) => {
        if (hideDropdown) {
            setShowFilterDropdown(false)
        } else {
            setShowFilterDropdown(showFilterDropdown ? false : true)
        }

    }
    const toggleFilterSelect = (listArr = null, selected = null) => {
        if(listArr == null){
            listArr = getListByCategory([...filtersList], groupBy)
        }
        if (listArr == null || selected == null) {
            return false
        }
        // console.log(listArr, selected);
        for (let lKey in listArr) {
            let item = listArr[lKey]
            let filters = item.list
            for (let fKey in filters) {
                let filter = filters[fKey]
                isObjInclude(selected, filter) && (editFilterInpRef.current[`${lKey}_${fKey}`].checked = true);
            }
        }
    }
    const togglFilterList = (event = null) => {
        let element = event.target
        if (event == null || element == null) {
            return false
        }
        let parentEle = element.closest(".filter_box")
        let titlebox = parentEle.classList.toggle(Styles.open)
        let content = parentEle.querySelector(".filter_list");
        if (content) {
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        }

    }
    const onToggleFilter = (event, data = null) => {
        if (event == null || data == null) {
            return false
        }
        event.stopPropagation()
        let selected = [...selectedFilter]
        let ele = event.target || event.srcElement
        let checked = ele.checked
        if (checked) {
            !isObjInclude(selected, data) && selected.push(data)
        } else {
            isObjInclude(selected, data) && selected.splice(selected.findIndex((item) => compareObjs(item, data)), 1)
        }
        setSelectedFilter(oldVal => [...selected])
        setShowFilterCheck(selected.length > 0 ? true : false)
        checked ? onSelect(selected) : onRemove(selected)
    }

    const clearFilters = () => {
        // let inpsArr = Object.values(editFilterInpRef.current)
        let parentEl = airFilters.current
        DelCookie("tmf")
        parentEl.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
        setSelectedFilter([])
        setShowFilterCheck(false)
        onRemove([])

    }

    return (
        <React.Fragment>
            <div id={id} ref={airFilters} className={`airFilter_sec ml-2 ${Styles[theme.style]} ${Styles[theme.type]} ${Styles.airFilter_sec} ${className}`}>
                <button type="button" className="border-0 bg-transparent h-100 w-100 position-relative" onClick={() => toggleFilterDropdown()}>
                    {showFilterCheck && <span className={`text-success ${Styles.filter_check}`}><i className="fa fa-check-circle"></i></span>}
                    <span><i className="fa fa-filter"></i></span>
                </button>
                <div className={`airFilter_dropdown ${Styles.airFilter_dropdown} ${dropdownClassName} ${showFilterDropdown ? Styles.show : Styles.hide}`}>
                    <div className={`filter_opts ${Styles.filter_opts} d-flex px-3 py-2`}>
                        <div></div>
                        <div><span className={`clr_btn  ${Styles.clr_btn}`} onClick={() => clearFilters()}> Clear all</span></div>
                    </div>
                    <div className={`filters_block ${Styles.filters_block}`}>
                        {filtersList && filtersList.length > 0 && React.Children.toArray(getListByCategory(filtersList, groupBy).map((item, flKey) => {
                            return (
                                <>
                                    <div className={`filter_box ${Styles.filter_box}`}>
                                        <div className={`filter_box_title ${Styles.filter_box_title} d-flex`}>
                                            <h4 onClick={(e) => togglFilterList(e)}>{item.group}</h4>
                                        </div>
                                        <ul className={`filter_list ${Styles.filter_list}`}>
                                            {item.list && item.list.length > 0 && React.Children.toArray(item.list.map((catList, clKey) => {
                                                return (
                                                    <li className={`filter_item ${Styles.filter_item}`} >
                                                        <label className="position-relative">
                                                            <input type="checkbox" ref={el => (editFilterInpRef.current[`${flKey}_${clKey}`] = el)} value={catList[displayValue]} className="w-0 h-0 position-absolute" onChange={(e) => onToggleFilter(e, catList)} />
                                                            <span className="d-block">{catList[displayValue]}</span>
                                                        </label>
                                                    </li>
                                                )
                                            }))}
                                        </ul>
                                    </div>
                                </>
                            )
                        }))}


                    </div>
                </div>
            </div>
        </React.Fragment>

    )
}





export default AirFilter