
import { useContext, useEffect, useRef, useState } from "react";
import Pagination from 'react-bootstrap/Pagination'
const AirPagination = (props) => {
    const {
        layout = 1,
        totalItems = 0,
        totalPages = 10,
        currentPage = 1,
        showAllPages = false,
        showPrevNextBtn = false,
        disablePages = [],
        limit = 0,
        onChangeLimit = null,
        onClickFn = null,
        offset = (currentPage-1)*limit,
        cClass = ''
    } = props

    // const [markDate, setMarkDate] = useState(null)


    const myRef = useRef();

    useEffect(() => {


    }, [])

    const getPages = (layout = 1) => {
        if (layout == 1) {
            return <Pagination.Item activeLabel={''} active={true} disabled={true} onClick={onClickFn}>{currentPage}</Pagination.Item>

        } else {
            return Array.from(Array(totalPages).keys()).map((val, i) => {
                return <Pagination.Item activeLabel={''} active={currentPage == i + 1} disabled={disablePages.indexOf(i + 1) != -1 || currentPage == i + 1} onClick={onClickFn}>{i + 1}</Pagination.Item>
            })
        }

    }

    if (layout == 1) {
        return (
            <div id="pagination_sec" className="container-fluid">
                <div className="d-flex alig-items-center justify-content-between">
                    <div className="page_limit_filter d-flex align-items-center justify-content-center">
                        <select className="form-control fw-600" defaultValue={limit} onChangeCapture={e => onChangeLimit(e.target.value)}>
                            <option value={''}>show entries</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="pagination_block d-flex align-items-center justify-content-center">
                        <Pagination className="pagination_layout_1" size="sm">
                            {
                                showPrevNextBtn
                                    ? <><Pagination.First onClick={e => onClickFn(e,"first")} /><Pagination.Prev onClick={e => onClickFn(e,"prev")}/></>
                                    : ''
                            }
                            {getPages(layout)}
                            {
                                showPrevNextBtn
                                    ? <><Pagination.Next onClick={e => onClickFn(e,"next")}/> <Pagination.Last onClick={e => onClickFn(e,"last")} /></>
                                    : ''
                            }
                        </Pagination>
                    </div>
                    <div className="pagination_infon fs-13 d-flex align-items-center justify-content-center">
                        <span>Showing {offset+1} to {offset+limit <= totalItems ? offset+limit : totalItems} of {totalItems} entries </span>
                    </div>

                </div>
            </div>

        )
    } else {
        return (
            <Pagination>
                    {
                        showPrevNextBtn
                            ? <><Pagination.First onClick={e => onClickFn(e,"first")} /><Pagination.Prev onClick={e => onClickFn(e,"prev")}/></>
                            : ''
                    }
                    {getPages(layout)}
                    {
                        showPrevNextBtn
                            ? <><Pagination.Next onClick={e => onClickFn(e,"next")}/> <Pagination.Last onClick={e => onClickFn(e,"last")} /></>
                            : ''
                    }
            </Pagination>
        )
    }



}





export default AirPagination