import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Line } from '@ant-design/plots'
import './App.css'
import { render } from "react-dom/cjs/react-dom.development";

export default function App() {
    //const [data, setData2] = useState([]);
    const [seriesField, setSeriesField] = useState(
        {
            "Вчера": null,
            "Сегодня": null,
            "Завтра": null,
        }
    )
    const [excelData, setData] = useState({});
    const countDate = '2022-01-22';

    // const data = [
    //     {
    //       year: '1991',
    //       value: -3,
    //     },
    //     {
    //       year: '1992',
    //       value: -4,
    //     },
    //     {
    //       year: '1993',
    //       value: -3.5,
    //     },
    //     {
    //       year: '1994',
    //       value: -5,
    //     },
    //     {
    //       year: '1995',
    //       value: -4.9,
    //     },
    //     {
    //       year: '1996',
    //       value: -6,
    //     },
    //     {
    //       year: '1997',
    //       value: -7,
    //     },
    //     {
    //       year: '1998',
    //       value: -9,
    //     },
    //     {
    //       year: '1999',
    //       value: -13,
    //     },
    //   ];

    useEffect(() => {
        fetchExcelFile();
    }, [])


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

            setData(selectedData);
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
        setSeriesField({"Вчера": dates[0], "Завтра": dates[1], "Сегодня": dates[2] });

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
    const renameKeys = (arr , oldKey, newKey) => { // function to rename on button click
        arr = arr.map(function(arr) {
            arr[`${newKey}`] = arr[`${oldKey}`]; // Assign new key
            delete arr[`${oldKey}`]; // Delete old key
            return arr;
        });
    }

    // удаление keys
    const deleteKeys = (arr , oldKey) => { // function to rename on button click
        arr = arr.map(function(arr) {
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
        // data,
        // yField: 'year',
        // xField: 'value',
        excelData,
        yField: 'district',
        xField: 'night',
        seriesField: 'date',
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
            trendCfg: {
              isArea: true,
            },
          },
          annotations: [
            {
              type: 'line',
              start: ['min', 'median'],
              end: ['max', 'median'],
              style: {
                stroke: '#c0c0c0',
                lineDash: [2, 2],
              },
            },
          ],
        // legend: false,
        //colors
        //color: ['#000000', '#ffffff', '#808080', '#c0c0c0', '#ff0000', '#008000'],
      };

    return (
        <div>
            <Line className='graph' {...config} />

            {/* <input type="file" onChange={onChange} /> */}
            <button onClick={click}>click me!</button>

            {/* <Line className='graph' {...config2} /> */}
        </div>
    );
}