/**
 * Objectをkeyでsortして返す
 * @param objects sort対象のObject
 * @param key sortするkey
 * @returns {Promise<*>}
 */
export function objectSort (objects, key) {
  objects.sort(function (a, b) {
    if (a[key] > b[key]) {
      return 1
    } else {
      return -1
    }
  })
  return objects
}

/**
 * 数字の桁数を３桁に自動調整し、単位を追記して返す
 * @param val
 * @param unitKey
 * @returns {string}
 */
export function setDigit (val, unitKey) {
  let res
  const units = [{
    1: ' KC',
    2: ' MC',
    3: ' GC'
  }, // for dietary energy
  {
    1: ' g',
    2: ' kg',
    3: ' t'
  }, // for protein
  {
    1: ' µg',
    2: ' mg',
    3: ' g'
  }, // for vit-A
  {
    1: ' mg',
    2: ' g',
    3: ' kt'
  } // for iron
  ]
  const item = Number(val || 0)
  switch (true) {
    case (item < 1000):
      res = String(Math.round(item)) + units[unitKey - 1]['1']
      break
    case (item >= 1000 && item < 1000000):
      res = String(Math.round(item / 1000)) + units[unitKey - 1]['2']
      break
    case (item >= 1000000):
      res = String(Math.round(item / 1000000)) + units[unitKey - 1]['3']
      break
    default:
      // eslint-disable-next-line no-console
      console.log('parameter not valid:setDigit')
      res = ''
      break
  }
  return res
}

/**
 * 2つのObjectが同じ内容であるかチェック（再起的）
 * @param object1 検査対象1
 * @param object2 検査対象2
 * @returns {boolean}
 */
export function isObjectDeepEqual (object1, object2) {
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (const key of keys1) {
    const val1 = object1[key]
    const val2 = object2[key]
    const areObjects = isObject(val1) && isObject(val2)
    if ((areObjects && !isObjectDeepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      // eslint-disable-next-line no-console
      console.log(val1)
      // eslint-disable-next-line no-console
      console.log(val2)
      return false
    }
  }
  return true
}

/**
 * object validation
 * Objectが特定のkeyを持つかどうかチェック
 * @param myObject 検査対象の変数
 * @param key チェックするkey(String表記)
 * @returns {boolean}
 */
export function isKeyContained (myObject, key) {
  const keys = Object.keys(myObject)
  return (keys.includes(key))
}

/**
 * Array validation
 *     Arrayであるかどうかチェック
 * @param item 検査対象の変数
 * @returns {boolean}
 */
export function isArray (item) {
  return Object.prototype.toString.call(item) === '[object Array]'
}

/**
 * Object validation
 *     Objectであるかどうかチェック
 * @param item 検査対象の変数
 * @returns {boolean}
 */
export function isObject (item) {
  return typeof item === 'object' && item !== null && !isArray(item)
}

/**
 * Validator for complex object
 * ネストしたObjectに必要なKeyが含まれているかを検証
 * @param data 検査対象のObject
 *     （例：
 *         const obj = {
 *             "type":"typeName","firstName":"Steven",
 *             "lastName":"Smith","address":{"primary":{"city":"abc",
 *             "street":{"name":{"subName":"someName"}}}}
 *                 };）
 * @param types validaterを指定（必要なkeyを配列で指定する
 *     例：const typeName = ['firstName', 'lastName', 'address', '
 *     address.primary', 'address.primary.city',
 *     'address.primary.street'];
 *     ）
 * @returns {*[]} dataに存在しないkeyを抽出
 */
export function validateObject (data, types) {
  const errors = []
  types.forEach((type) => {
    const keys = type.split('.')
    let datum = {
      ...data
    }
    // Loop through the keys
    for (const [index, key] of keys.entries()) {
      // Check if the key is not available in the data
      // then push the corresponding key to the errors array
      // and break the loop
      // 以下の行を、if (!datum[key]) { とすればkeyの存在＋値の有無をチェックする
      if (datum[key] === undefined) {
        errors.push(keys.slice(0, index + 1).join('.'))
        break
      }
      datum = datum[key]
    }
  })
  return errors
}

/**
 * myAppのバリデーション
 * @param dat 検証するmyApp
 * @returns {false|boolean}
 */
export function validateMyApp (dat) {
  // myAppの型設計
  const typeName = ['user', 'dataSet', 'sceneCount', 'scene', 'menuCases', 'feasibilityCases', 'saveDate', 'user.displayName', 'user.email', 'user.country', 'user.subnational1', 'user.subnational2', 'user.subnational3', 'user.organization', 'user.title', 'user.uid', 'user.phoneNumber', 'dataSet.fctId', 'dataSet.driId', 'dataSet.regionId', 'dataSet.fct', 'dataSet.dri']
  let res = true
  const myError = validateObject(dat, typeName)
  if (myError.length > 0) {
    // eslint-disable-next-line no-console
    console.log(myError)
    res = false
  }

  return isObject(dat) && res
}

export function validateMyFamily (dat) {
  // myFamilyの型設計
  const typeName = ['name', 'member', 'menuCases', 'feasibilityCases']
  let res = true
  const myError = validateObject(dat, typeName)
  if (myError.length > 0) {
    // eslint-disable-next-line no-console
    console.log('validateMyFamily: property check failed')
    // eslint-disable-next-line no-console
    console.log(myError)
    res = false
  }

  return isObject(dat) && res
}

/**
 * FCTのバリデーション
 * @param dat 検証するFCT
 * @returns {false|boolean}
 */
export function validateFct (dat) {
  // FCTの型設計
  const typeName = ['Carbohydrate', 'Energy', 'FE', 'Fat', 'Food_name', 'Protein', 'VITA_RAE', 'food_group_unicef', 'food_grp_id', 'FCT_id']
  let res = true
  const myError = validateObject(dat, typeName)
  if (myError.length > 0) {
    // eslint-disable-next-line no-console
    console.log(myError)
    res = false
  }

  return isObject(dat) && res
}

/**
 * portionUnitのバリデーション
 * @param dat 検証するportionUnit
 * @returns {false|boolean}
 */
export function validatePortionUnit (dat) {
  // portionUnitの型設計
  const typeName = ['id', 'FCT_id', 'unit_weight', 'count_method']
  let res = true
  const myError = validateObject(dat, typeName)
  if (myError.length > 0) {
    // eslint-disable-next-line no-console
    console.log(myError)
    res = false
  }

  return isObject(dat) && res
}

export function validateMacroNutrient (dat) {
  const check1 = (dat.length === 3 || dat.length === 4)
  let check2 = false
  const typeName = ['val', 'color']
  if (check1) {
    check2 = true
    dat.forEach((item) => {
      const myError = validateObject(item, typeName)
      if (myError.length > 0) {
        // eslint-disable-next-line no-console
        console.log(myError)
        check2 = false
      }
      if (!(item.val >= 0)) {
        // eslint-disable-next-line no-console
        console.log('Param Error: validateMacroNutrient')
        // eslint-disable-next-line no-console
        console.log(dat)
        // eslint-disable-next-line no-console
        console.log(item)
        check2 = false
      }
    })
  }
  return check2
}

/**
 * ターゲットグループの構成とdri一蘭から栄養需要を計算する
 * @param target ターゲット構成[id, count]
 * @param dri
 * @returns {*}
 */
export function getNutritionDemand (target, dri) {
  const initObj = {
    En: 0,
    Pr: 0,
    Va: 0,
    Fe: 0,
    Wt: 0
  }
  if (!target || (target.length === 0)) {
    return initObj
  }
  return target.reduce((accumulator, currentItem, index) => {
    const count = Number(currentItem.count)
    accumulator.En += count * Number(dri[index].En)
    accumulator.Pr += count * Number(dri[index].Pr)
    accumulator.Va += count * Number(dri[index].Va)
    accumulator.Fe += count * Number(dri[index].Fe)
    accumulator.Wt += count * Number(dri[index].Wt)
    return accumulator
  }, initObj)
}

/**
 * targetグループから栄養摂取目標を計算
 * targetGroupの構造が呼び出し元によって異なるため、フラグで切り分けられるように設定
 * @param targetGroup
 * @param dri
 * @param dietCalkCheck dietCalkCheckから呼び出されたかどうかチェック
 * @returns {*}
 */
export function getNutritionDemandList (targetGroup, dri, dietCalkCheck = 0) {
  return targetGroup.map(function (item) {
    // targetGroupの構造が呼び出し元によって異なるため、フラグで切り分けられるように設定
    if (dietCalkCheck) {
      return getNutritionDemand(item.target, dri)
    } else {
      return getNutritionDemand(item, dri)
    }
  })
}

/**
 * 選択された作物一蘭から栄養供給量を計算
 * @param datArray
 * @param stapleCheck
 * @returns {*}
 */
export function getNutritionSupply (datArray, stapleCheck = 0) {
  return datArray.reduce((accumulator, item) => {
    // Pr, Fe, Fatについて、別変数を用意
    let myPr = item.Pr ? item.Pr : 0
    let myFe = item.Fe ? item.Fe : 0
    let myFat = item.Fat ? item.Fat : 0

    // stapleCheck=1, かつ食品群がstapleであった場合、Pr、Fe の値を無視
    if (stapleCheck === 1 && Number(item.food_grp_id) === 1) {
      myPr = 0
      myFe = 0
      myFat = 0
    }
    // 循環参照を回避するため定数に切り替えて代入
    const En = item.En ? item.En : 0
    const Va = item.Va ? item.Va : 0
    const Carbohydrate = item.Carbohydrate ? item.Carbohydrate : 0
    const Wt = item.Wt

    accumulator.En += Number(En) * Number(Wt) / 100
    accumulator.Pr += Number(myPr) * Number(Wt) / 100
    accumulator.Va += Number(Va) * Number(Wt) / 100
    accumulator.Fe += Number(myFe) * Number(Wt) / 100
    accumulator.Carbohydrate += Number(Carbohydrate) * Number(Wt) / 100
    accumulator.Fat += Number(myFat) * Number(Wt) / 100
    accumulator.Wt += Number(Wt)
    return accumulator
  }, {
    En: 0,
    Pr: 0,
    Va: 0,
    Fe: 0,
    Wt: 0,
    Carbohydrate: 0,
    Fat: 0
  })
}

/**
 * 栄養必要量、栄養供給量, 目標充足率から必要な作物位の生産量を計算する
 * @param nutrientsDemand
 * @param nutrientsSupply
 * @param keyNutrient
 * @param share
 * @returns {number|number}
 */
export function getProductionTarget (nutrientsDemand, nutrientsSupply, keyNutrient, share) {
  const rep1 = nutrientsDemand[keyNutrient] ? nutrientsDemand[keyNutrient] : 0
  const rep2 = nutrientsSupply ? nutrientsSupply[keyNutrient] : 0
  return rep2 ? Math.round((rep1 * 100 / rep2) * share / 100) : 0
}

/**
 * 選択された作物から栄養供給量を計算
 * @param crops
 * @param count
 * @param stapleCheck
 * @returns {{Pr: number, Fat: number, En: number, Carbohydrate: number, Va: number, Wt: number, Fe: number}[]|*}
 */
export function getNutritionSupplyList (crops, count, stapleCheck = 1) {
  const initObj = {
    En: 0,
    Pr: 0,
    Va: 0,
    Fe: 0,
    Wt: 0,
    Carbohydrate: 0,
    Fat: 0
  }
  // 作物未選択の場合、初期値（全て0）を設定
  if (crops.length === 0) {
    return [...Array(count)].map(() => initObj)
  }
  return crops.map((datArray) => {
    let res = initObj
    if (datArray.length !== 0) {
      if (datArray.menu.length > 0) {
        res = getNutritionSupply(datArray.menu, stapleCheck)
      }
    }
    return res
  })
}

/**
 * recepiTableが更新される度に、pfcBalanceCurrent
 *    の値を更新
 *    conversion factor
 *    -Carbohydrate: 4Kcal/gram
 *    -Protein: 4Kcal/gram
 *    -Fat: 9Kcal/gram
 *
 * labelに指定した値が表示用に使われる。空白の場合はvalの値が表示される
 *
 */
export function updatePfc (supply) {
  return supply.map((dat) => {
    const Pr = Math.round(dat.Pr * 4)
    const Fat = Math.round(dat.Fat * 9)
    const Carbohydrate = Math.round(dat.Carbohydrate * 4)

    return {
      labels: ['protein', 'fat', 'carbo.'],
      datasets: [{
        label: 'Data One',
        backgroundColor: ['green', 'yellow', 'red'],
        data: [Pr, Fat, Carbohydrate]
      }]
    }
  })
}

/**
 * 総エネルギーの充足率をグラフ用のscaleに変更
 * @param rating
 * @returns {*}
 */
export function getPfcScale (rating) {
  return rating.map((item) => {
    const res = item.En / 10
    if (res < 0.5) {
      return 0.5
    }
    if (res > 1.5) {
      return 1.5
    }
    return res
  })
}

/**
 * nutritionSupplyの平均値
 * @param nutritionSupplyList
 * @returns {{Pr: number, Fat: number, En: number, Carbohydrate: number, Va: number, Wt: number, Fe: number}}
 */
export function getAverageNutritionSupply (nutritionSupplyList) {
  let count = 0
  const supplySum = nutritionSupplyList.reduce((accumulator, item) => {
    if (item.Wt > 0) {
      count += 1
      accumulator.En += Number(item.En)
      accumulator.Pr += Number(item.Pr)
      accumulator.Va += Number(item.Va)
      accumulator.Fe += Number(item.Fe)
      accumulator.Carbohydrate += Number(item.Carbohydrate)
      accumulator.Fat += Number(item.Fat)
      accumulator.Wt += Number(item.Wt)
    }
    return accumulator
  }, {
    En: 0,
    Pr: 0,
    Va: 0,
    Fe: 0,
    Wt: 0,
    Carbohydrate: 0,
    Fat: 0
  })
  return {
    En: supplySum.En / count,
    Pr: supplySum.Pr / count,
    Va: supplySum.Va / count,
    Fe: supplySum.Fe / count,
    Wt: supplySum.Wt / count,
    Carbohydrate: supplySum.Carbohydrate / count,
    Fat: supplySum.Fat / count
  }
}

/**
 * nutritionDemandGetterの平均値
 * @param nutritionDemandList
 * @returns {{Pr: number, En: number, Va: number, Wt: number, Fe: number}}
 */
export function getAverageNutritionDemand (nutritionDemandList) {
  let count = 0
  const demandSum = nutritionDemandList.reduce((accumulator, item) => {
    if (item.En > 0) {
      count += 1
      accumulator.En += Number(item.En ? item.En : 0)
      accumulator.Pr += Number(item.Pr ? item.Pr : 0)
      accumulator.Va += Number(item.Va ? item.Va : 0)
      accumulator.Fe += Number(item.Fe ? item.Fe : 0)
      accumulator.Wt += Number(item.Wt ? item.Wt : 0)
    }
    return accumulator
  }, {
    En: 0,
    Pr: 0,
    Va: 0,
    Fe: 0,
    Wt: 0
  })
  return {
    En: demandSum.En / count,
    Pr: demandSum.Pr / count,
    Va: demandSum.Va / count,
    Fe: demandSum.Fe / count,
    Wt: demandSum.Wt / count
  }
}

/**
 * nutritionSupplyとnutritionDemandの値に基づいて栄養素の充足率を算出
 * @param nutritionSupply
 * @param nutritionDemand
 * @param count
 * @returns {*[]}
 */
export function getRating (nutritionSupply, nutritionDemand, count) {
  const res = []
  for (let i = 0; i < count; i++) {
    const supply = nutritionSupply[i]
    const demand = nutritionDemand[i]
    res.push({
      En: demand.En ? Math.round(100 * supply.En / demand.En) / 10 : 0,
      Pr: demand.Pr ? Math.round(100 * supply.Pr / demand.Pr) / 10 : 0,
      Va: demand.Va ? Math.round(100 * supply.Va / demand.Va) / 10 : 0,
      Fe: demand.Fe ? Math.round(100 * supply.Fe / demand.Fe) / 10 : 0
    })
  }
  return res
}

/**
 * menuCasesに含まれるfood Groupから、何種類の食品群が含まれるか判定
 * @param menuCases
 * @param foodGroup
 * @returns {*}
 */
export function getDiversityStatusForTable (menuCases, foodGroup) {
  if (!Object.keys(menuCases).length) {
    return {}
  }
  return menuCases.map((foodsTemp, index) => {
    const res = {}
    const colorVariant = {}
    res.case = 'Case' + (index + 1)
    colorVariant.case = 'primary'
    foodGroup.forEach((foodItem) => {
      res[foodItem] = ''
      colorVariant[foodItem] = 'danger'
    })
    if (foodsTemp.menu.length) {
      foodsTemp.menu.forEach((dat1) => {
        if (foodGroup.includes(dat1.Group)) {
          colorVariant[dat1.Group] = 'info'
        }
      })
    }
    res._cellVariants = colorVariant
    return res
  })
}

/**
 * menuCasesに含まれるfood Groupから、何種類の食品群が含まれるか判定
 * @returns {*[]}
 */
export function getDiversityStatus (menuCases, foodGroup) {
  if (menuCases !== []) {
    return menuCases.map((foodsTemp) => {
      const res = foodGroup.map((groupTemp) => {
        return { [groupTemp]: false }
      })
      if (foodsTemp.menu.length) {
        foodsTemp.menu.forEach((dat1) => {
          const indexTemp = foodGroup.indexOf(dat1.Group)
          if (indexTemp >= 0) {
            res[indexTemp][dat1.Group] = true
          }
        })
      }
      return res
    })
  } else {
    return []
  }
}

/**
 * FCTからfood Groupを抽出
 * @returns {*}
 */
export function getFoodGroup (fct) {
  return fct.reduce((accumulator, dat) => {
    if (!accumulator.includes(dat.Group)) {
      accumulator.push(dat.Group)
    }
    return accumulator
  }, [])
}

/**
 * ネストしたObjectを初期化（クリア）
 * @param delObj
 */
export function deleteObject (delObj) {
  for (const prop in delObj) {
    // eslint-disable-next-line no-prototype-builtins
    if (delObj.hasOwnProperty(prop)) {
      switch (typeof (delObj[prop])) {
        case 'object':
          deleteObject(delObj[prop])
          break
        default:
          delete delObj[prop]
          break
      }
    }
  }
}

/**
 * jsonをCSVに変換
 * key0: [key1: value] 形式 → Array of CSV (val1, val2, val3, val4)
 */
export function json2Csv (datJson) {
  const commaDelimitedArray = []
  if (datJson) {
    const myKeys = Object.keys(Object.values(datJson)[0])
    commaDelimitedArray.push(String(myKeys))

    Object.values(datJson).forEach((item) => {
      let singleLine = ''
      myKeys.forEach((myKeyItem, index) => {
        singleLine += item[myKeyItem] + ','
        // 末尾のコンマを削除する
        if (index === myKeys.length - 1) {
          singleLine = singleLine.slice(0, -1)
        }
      })
      commaDelimitedArray.push(singleLine)
    })
  }
  let csvText = ''
  commaDelimitedArray.forEach((item, index) => {
    csvText += String(item) + '\n'
    // 末尾の改行を削除する
    if (index === commaDelimitedArray.length - 1) {
      csvText = csvText.slice(0, -1)
    }
  })
  return csvText
}

export function makeToast (vm, message = 'test', options = {}) {
  vm.$bvToast.toast(message, {
    title: options.title || 'message',
    variant: options.variant || 'danger',
    autoHideDelay: options.autoHideDelay || 5000,
    appendToast: options.autoHideDelay || true,
    'no-auto-hide': options.noAutoHide || false,
    solid: true
  })
}
