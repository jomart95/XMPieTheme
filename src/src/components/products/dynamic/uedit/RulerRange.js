import React from 'react';
import './RulerRange.scss';

const RulerRange = ({ min = 0, max = 360, step = 1, divisions = 10, value, onChange }) => {
    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i <= divisions; i++) {
            ticks.push(
                <div
                    key={i}
                    className="tick"
                    style={{
                        left: `${(i / divisions) * 100}%`,
                        height: i % 5 === 0 ? '26px' : '20px',
                        background:  i % 5 === 0 ? "#000" : "##595959"
                    }}
                />
            );
        }
        return ticks;
    };

    return (
        <div className="range-wrapper">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
            />
            {renderTicks()}
        </div>
    );
};

export default RulerRange;
