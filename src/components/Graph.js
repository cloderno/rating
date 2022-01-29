import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Line } from '@ant-design/plots'
import './App.css'
import { render } from "react-dom/cjs/react-dom.development";

export default function App() {
    const [data, setData] = useState([]);
    const [seriesField, setSeriesField] = useState(
        {
            "Вчера": null,
            "Сегодня": null,
            "Завтра": null,
        }
    )
    const [excelData, setExcelData] = useState({});
    const countDate = '2022-01-22';

    useEffect(() => {
        fetchExcelFile();
        asyncFetch();
    }, [])

    const asyncFetch = () => {
        fetch('https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json')
            .then((response) => response.json())
            .then((json) => setData(json))
            .catch((error) => {
                console.log('fetch data failed', error);
            });
    };

    // получаем данные из ексель
    const fetchExcelFile = () => {
        fetch("weather_three_days.xlsx")
            .then(res => res.arrayBuffer())
            .then(ab => {
                const wb = XLSX.read(ab, { type: "array" })
                const wsName = wb.SheetNames[0];
                const ws = wb.Sheets[wsName];
                const data = XLSX.utils.sheet_to_json(ws);

                let selectedData = selectData(data, countDate);

                setExcelData(selectedData);
            });
    };

    // конвертируем 5 значные цифры ексели в дату
    const dateToJs = (date) => {
        let result = new Date(Math.round((date - 25569) * 86400 * 1000)).toISOString();
        return result.slice(0, result.indexOf('T'));
    }

    // получаем предыдущий и следующий день
    const prevAndNext = (date) => {
        let prev_date = new Date(new Date(date).setDate(new Date(date).getDate() - 1)).toISOString();
        let next_date = new Date(new Date(date).setDate(new Date(date).getDate() + 1)).toISOString();

        return [prev_date.slice(0, prev_date.indexOf('T')), date, next_date.slice(0, next_date.indexOf('T'))];
    }

    // выборка данных по дате
    const selectData = (data, chosenDate) => {
        // получаем все данные, конвертируем и пушим во временную переменную
        let temp = [];

        const dates = prevAndNext(chosenDate); //выбираем нужную дату
        setSeriesField({ "Вчера": dates[0], "Завтра": dates[1], "Сегодня": dates[2] });

        data.map(i => {
            let date = dateToJs(i.Дата);
            i.Дата = date;

            for (let j = 0; j < 3; j++) {
                if (date == dates[j]) {
                    temp.push(i);
                }
            }
        })

        renameKeys(temp, "Дата", "date")
        renameKeys(temp, "Районы", "district")
        renameKeys(temp, "ночь,до", "night")
        renameKeys(temp, "день,до", "day")
        deleteKeys(temp, "ночь,от")
        deleteKeys(temp, "день, от")
        console.log(temp);

        return temp
    }

    // меняем keys наших объектов для того чтобы можно было выбрать их в графике
    const renameKeys = (arr, oldKey, newKey) => { // function to rename on button click
        arr = arr.map(function (arr) {
            arr[`${newKey}`] = arr[`${oldKey}`]; // Assign new key
            delete arr[`${oldKey}`]; // Delete old key
            return arr;
        });
    }

    // удаление keys
    const deleteKeys = (arr, oldKey) => { // function to rename on button click
        arr = arr.map(function (arr) {
            delete arr[`${oldKey}`]; // Delete old key
            return arr;
        });
    }

    const click = () => {
        console.log(excelData);
        console.log(seriesField);

        // for (let i = 0; i < eachDate; i++) {
        //     excelData.map( item => {
        //         let arrs = Object.values(item)
        //         //console.log(arrs.length)
        //     }) 
        //     let arrs = Object.values(i)
        //     console.log(arrs)
        // }
        // excelData.map( item => {
        //     let arrs = Object.values(item)
        //     //console.log(arrs.length)
        // }) 
    }

    const config = {
        data,
        xField: 'year',
        yField: 'value',
        seriesField: 'category',
        // excelData,
        // yField: 'district',
        // xField: 'night',
        // seriesField: 'date',
        legend: {
            itemName: {
                style: {
                    fill: '#fff'
                }
            }
        },
        xAxis: {
            grid: {
                line: {
                    style: {
                        stroke: '#2a4566'
                    }
                }
            },
            label: {
                style: {
                    fill: '#fff'
                },
            }
        },
        yAxis: {
            grid: {
                line: {
                    style: {
                        stroke: '#2a4566'
                    }
                }
            },
            label: {
                style: {
                    fill: '#fff'
                },
                formatter: (v) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
            },
        },
        point: {
            size: 0,
            shape: 'diamond',
            style: {
                fill: 'white',
                stroke: '#2593fc',
                lineWidth: 2,
            },
        },
        slider: {
            start: 0.1,
            end: 0.9,
            textStyle: {
                opacity: 0
            },
            trendCfg: {
                isArea: true,
            },
            handlerStyle: {
                radius: 10,
                width: 20,
                fill: '#303950',
                cursor: 'grabbing'
            },
            trendCfg: {
                backgroundStyle: {
                    fill: '#3b4b65',
                },
                lineStyle: {
                    fill: 'transparent'
                }
            }
        },
        //   annotations: [
        //     {
        //       type: 'line',
        //       start: ['min', 'median'],
        //       end: ['max', 'median'],
        //       style: {
        //         stroke: '#c0c0c0',
        //         lineDash: [2, 2],
        //       },
        //     },
        //   ],
        // 
        //colors
        //color: ['#000000', '#ffffff', '#808080', '#c0c0c0', '#ff0000', '#008000'],
    };

    return (
        <div className="container">
            <Line className='graph' {...config} />

            <button onClick={click}>click me!</button>
        </div>
    );
}