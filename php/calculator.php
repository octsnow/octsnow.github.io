<!DOCTYPE html>
<html>

<head>
<style>
    p{
        display: block;
    }
</style>
</head>

<body>
    <?php
		$input_operand = $_POST['operand'];
        $input_operator = $_POST['operator'];
        $register_operand = $_POST['register_operand'];
        $register_operator = $_POST['register_operator'];
		$operation = $_POST['operation'];
	?>
    <p>
        <?php
			// operation
			switch($operation){
				case 'CE':
					$input_operand = null;
					break;
				case 'C':
					$input_operand = null;
					$input_operator = null;
					$register_operand = null;
					$register_operator = null;
					break;
				case 'bs':
					$str_len = strlen($input_operand);
					if($str_len != 0){
						$str_array = str_split($input_operand);
						$input_operand = "";
						for($i = 0; $i < $str_len - 1; $i++){
							$input_operand .= $str_array[$i];
						}
					}
					break;
				case '±':
					$str_len = strlen($input_operand);
					$str_array = str_split($input_operand);
					if($str_array[0] === '-'){
						$input_operand = "";
						for($i = 1; $i < $str_len; $i++){
							$input_operand .= $str_array[$i];
						}
					} else {
						$input_operand = "-".$input_operand;
					}
					break;
				case '.':
					if(!preg_match('/\./', $input_operand)){
						$input_operand .= ".";
					}
					break;
			}
			$operation = null;
            // calculate
            if(preg_match('#[+-/*=]#', $input_operator)){
                if($register_operator === ""){
                    if(is_numeric($input_operand)){
						if(gettype($input_operand) === "integer"){
                        	$register_operand = intval($input_operand);
						} else {
							$register_operand = floatval($input_operand);
						}
                    	$register_operator = $input_operator;
                    }
                    $input_operand = null;
                    $input_operator = null;
                }else{
                    if(is_numeric($input_operand)){
                        switch($register_operator){
                            case "+":
								if(gettype($input_operand) === "integer"){
                                	$result = $register_operand + intval($input_operand);
								} else {
                                	$result = $register_operand + floatval($input_operand);
								}
                                break;
                            case "-":
								if(gettype($input_operand) === "integer"){
                                	$result = $register_operand - intval($input_operand);
								} else {
                                	$result = $register_operand - floatval($input_operand);
								}
                                break;
                            case "/":
								if(gettype($input_operand) === "integer"){
                                	$result = $register_operand / intval($input_operand);
								} else {
                                	$result = $register_operand / floatval($input_operand);
								}
                                break;
                            case "*":
								if(gettype($input_operand) === "integer"){
                                	$result = $register_operand * intval($input_operand);
								} else {
                                	$result = $register_operand * floatval($input_operand);
								}
                                break;
                        }
                    }else{
                        $result = $resister_operand;
                    }
                    $register_operand = $result;
                    $register_operator = $input_operator;
                }

                if($input_operator === "="){
                    $input_operand = $register_operand;
					$input_operator = null;
					$register_operand = null;
					$register_operator = null;
                }
            }
        	// show display
            if($input_operand === null || $input_operand === ""){
                echo "0";
            }else{
                echo $input_operand;
            }
        ?>
    </p>
    <form action="?" method="post">
        <input type="hidden" name="operand" value="<?php echo $input_operand ?>">
        <input type="hidden" name="register_operand" value="<?php echo $register_operand ?>">
        <input type="hidden" name="register_operator" value="<?php echo $register_operator ?>">
        <input type="hidden" name="operation" value="<?php echo $operation ?>">
        <table>
            <tr>
                <td><button type="submit" name="operation" value="<?php echo "CE" ?>">CE</button></td>
                <td><button type="submit" name="operation" value="<?php echo "C" ?>">C</button></td>
                <td><button type="submit" name="operation" value="<?php echo "bs" ?>">bs</button></td>
                <td><button type="submit" name="operator" value="<?php echo "/" ?>">÷</button></td>
            </tr>
            <tr>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."9" ?>">9</button></td>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."8" ?>">8</button></td>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."7" ?>">7</button></td>
                <td><button type="submit" name="operator" value="<?php echo "*" ?>">×</button></td>
            </tr>
            <tr>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."6" ?>">6</button></td>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."5" ?>">5</button></td>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."4" ?>">4</button></td>
                <td><button type="submit" name="operator" value="<?php echo "-" ?>">-</button></td>
            </tr>
            <tr>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."3" ?>">3</button></td>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."2" ?>">2</button></td>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."1" ?>">1</button></td>
                <td><button type="submit" name="operator" value="<?php echo "+" ?>">+</button></td>
            </tr>
            <tr>
                <td><button type="submit" name="operation" value="<?php echo "±" ?>">±</button></td>
                <td><button type="submit" name="operand" value="<?php echo $input_operand."0" ?>">0</button></td>
                <td><button type="submit" name="operation" value="<?php echo "." ?>">.</button></td>
                <td><button type="submit" name="operator" value="<?php echo "=" ?>">=</button></td>
            </tr>
        </table>
    </form>
</body>

</html>
