import React from 'react';
import { FaBarcode } from 'react-icons/fa';

const BarcodeLabel = ({ item, shopName }) => {
    if (!item) return null;

    return (
        <div className="print-only label-container">
            <div className="label-content">
                <p className="shop-name">{shopName}</p>
                <p className="item-name">{item.name}</p>
                <div className="barcode-visual">
                    {/* Simulated 1D Barcode using CSS bars */}
                    <div className="bars">
                        {[...Array(25)].map((_, i) => (
                            <div
                                key={i}
                                className="bar"
                                style={{ width: (Math.random() * 2 + 1) + 'px', height: '30px', background: 'black' }}
                            ></div>
                        ))}
                    </div>
                </div>
                <p className="barcode-text">{item.barcode || 'NO-BARCODE'}</p>
                <p className="price-tag">${parseFloat(item.unit_price).toFixed(2)}</p>
            </div>

            <style jsx="true">{`
                .label-container {
                    width: 40mm;
                    height: 25mm;
                    padding: 2mm;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 0.1mm solid #eee;
                }
                .label-content {
                    text-align: center;
                    width: 100%;
                }
                .shop-name {
                    font-size: 6pt;
                    font-weight: 900;
                    text-transform: uppercase;
                    margin: 0;
                }
                .item-name {
                    font-size: 7pt;
                    font-weight: 800;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 1mm 0;
                }
                .barcode-visual {
                    display: flex;
                    justify-content: center;
                    margin: 1mm 0;
                }
                .bars {
                    display: flex;
                    gap: 1px;
                    align-items: center;
                }
                .barcode-text {
                    font-size: 5pt;
                    font-family: monospace;
                    margin: 0;
                }
                .price-tag {
                    font-size: 9pt;
                    font-weight: 900;
                    margin-top: 1mm;
                }
                @media print {
                    @page { size: 40mm 25mm; margin: 0; }
                    .label-container { border: none; }
                }
            `}</style>
        </div>
    );
};

export default BarcodeLabel;
